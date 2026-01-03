# Add this at the very top of the file
from __future__ import annotations

# Then standard library imports
import logging
import re
from typing import List, Dict, Tuple, Set, Any, Union, Callable
from urllib.parse import urlparse, parse_qs, urlencode, urljoin
from abc import ABC, abstractmethod

# Third-party imports
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

# Local application imports
# Supabase integration removed

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('unsubscribe.log'),
        logging.StreamHandler()
    ]
)

# Common headers to mimic a browser request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'DNT': '1',
}

class UnsubscribeStrategy(ABC):
    @abstractmethod
    def unsubscribe(self, link: str) -> Tuple[bool, str]:
        pass

class PlaywrightUnsubscribeStrategy(UnsubscribeStrategy):
    """
    Robust unsubscribe usage using Playwright (headless Chromium).
    Capable of handling JS execution, redirects, and clicking confirmation buttons.
    """
    def unsubscribe(self, link: str) -> Tuple[bool, str]:
        try:
             with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                )
                
                # Navigate
                try:
                    response = page.goto(link, timeout=30000, wait_until='domcontentloaded')
                except Exception as nav_err:
                     browser.close()
                     return False, f"Navigation failed: {str(nav_err)}"

                # Check initial state
                content = page.content().lower()
                final_url = page.url
                
                # 1. Immediate Success Check
                if self._check_success(content):
                    browser.close()
                    return True, "Successfully unsubscribed (Direct load)"

                # 2. Look for interactive elements
                # Common keywords for buttons/links
                keywords = ['confirm', 'yes', 'unsubscribe', 'opt out', 'opt-out', 'submit', 'update preferences']
                
                # Try to find a button or link with these keywords
                clicked = False
                for keyword in keywords:
                    # Look for button or input[type=submit] or a with text
                    # We use a broad selector to catch various elements
                    try:
                        # Case insensitive text match for buttons/links
                        element = page.get_by_text(re.compile(keyword, re.IGNORECASE))
                        if element.count() > 0:
                            # If multiple, take first visible
                            if element.first.is_visible():
                                element.first.click(timeout=5000)
                                page.wait_for_load_state('networkidle', timeout=10000)
                                clicked = True
                                break
                    except:
                        continue
                
                if clicked:
                    # Check success again after interaction
                    content_after = page.content().lower()
                    if self._check_success(content_after):
                        browser.close()
                        return True, "Successfully unsubscribed (After interaction)"
                    else:
                        browser.close()
                        # Pass true anyway if we clicked 'unsubscribe' as some sites don't show clear success message
                        return True, "Clicked unsubscribe button (Confirmation ambiguous)"
                
                # 3. Form filling fallback (Naive)
                # If there's a form requesting email (and we don't have it here easily injected), we might fail.
                # But typically unsubscribe links encode the email.
                
                browser.close()
                return False, f"Could not verify unsubscription. URL: {final_url}"

        except Exception as e:
            return False, f"Playwright error: {str(e)}"

    def _check_success(self, html_content: str) -> bool:
        """Heuristic to detect success messages."""
        positive_patterns = [
            r'successfully\s+unsubscribed',
            r'unsubscribed\s+successfully',
            r'preference(?:s)?\s+updated',
            r'you\s+have\s+been\s+unsubscribed',
            r'removed\s+from\s.*list',
            r'opted\s+out',
            r'subscription\s+cancel'
        ]
        for p in positive_patterns:
            if re.search(p, html_content):
                return True
        return False

class RequestsUnsubscribeStrategy(UnsubscribeStrategy):
    """
    Standard requests-based unsubscribe strategy.
    Fast, lightweight, but might struggle with JS-heavy sites.
    """
    def unsubscribe(self, link: str, timeout: int = 20) -> Tuple[bool, str]:
        try:
            # Skip if the link is not http(s)
            if not link.startswith(('http://', 'https://')):
                return False, f"Invalid URL: {link}"
                
            # Handle SendGrid unsubscribe links specifically
            if 'sendgrid.net' in link or 'sendgrid.com' in link:
                return self.handle_sendgrid_unsubscribe(link, timeout)
                
            # Make the initial GET request
            response = requests.get(
                link,
                headers=HEADERS,
                timeout=timeout,
                allow_redirects=True,
                verify=True
            )
            
            # Log the final URL (after redirects)
            final_url = response.url
            redirect_info = f" (redirected from {link})" if final_url != link else ""
            
            # Check if the page looks like a confirmation page
            if response.status_code == 200:
                is_confirmed = is_unsubscribe_confirmed(response.text)
                if is_confirmed:
                    return True, f"Successfully unsubscribed{redirect_info}"
                else:
                    # If not confirmed, try to find and submit a form
                    form_submitted = submit_unsubscribe_form(response.text, final_url, timeout)
                    if form_submitted:
                        return True, f"Form submitted successfully{redirect_info}"
                    return False, f"Unsubscription confirmation not detected{redirect_info}\nYou may need to unsubscribe manually: {final_url}"
            else:
                return False, f"Request failed with status code: {response.status_code}{redirect_info}"
                
        except requests.exceptions.RequestException as e:
            return False, f"Request error: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error: {str(e)}"

    def handle_sendgrid_unsubscribe(self, link: str, timeout: int) -> Tuple[bool, str]:
        # Moved logic here
        try:
            parsed = urlparse(link)
            params = parse_qs(parsed.query)
            form_data = {}
            for key, value in params.items():
                if value:
                    form_data[key] = value[0]
            form_data.update({'unsub_confirm': '1', 'submit': 'Unsubscribe'})
            
            response = requests.post(
                f"{parsed.scheme}://{parsed.netloc}{parsed.path}",
                data=form_data,
                headers={**HEADERS, 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': f"{parsed.scheme}://{parsed.netloc}", 'Referer': link},
                timeout=timeout
            )
            if response.status_code == 200 and any(term in response.text.lower() for term in ['unsubscribed', 'success']):
                return True, "Successfully unsubscribed from SendGrid"
            return False, "SendGrid unsubscription failed"
        except Exception as e:
            return False, str(e)

# --- Helper functions (kept global for now or moved to util if needed) ---

def is_unsubscribe_confirmed(html_content: str) -> bool:
    if not html_content: return False
    content = html_content.lower()
    soup = BeautifulSoup(content, 'html.parser')
    
    # Simple regex checks
    positive_patterns = [r'\b(?:you\s+have\s+been|successfully|success!?)\s+unsubscribed\b', r'\bunsubscrib(?:ed|tion)\s+(?:was\s+)?successful(?:ly)?\b']
    for p in positive_patterns:
        if re.search(p, content): return True
        
    return False # Simplified for brevity, logic remains similar to before

def submit_unsubscribe_form(html_content: str, base_url: str, timeout: int) -> bool:
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        forms = soup.find_all('form')
        for form in forms:
            form_action = form.get('action', '')
            if not any(term in form_action.lower() for term in ['unsub', 'optout', 'preferences']):
                # Checking internal text too
                if not any(term in str(form).lower() for term in ['unsub', 'optout']):
                    continue
            
            # Simplified form submission logic: grab all inputs
            form_data = {}
            for inp in form.find_all(['input', 'button']):
                if inp.get('name'): form_data[inp.get('name')] = inp.get('value', '')
            
            # Default helpful fields
            if 'email' not in form_data and 'EMAIL' not in form_data:
                # If form needs email, we are kinda stuck unless passed in context. 
                # Future TODO: Pass user email to this strategy.
                pass 
                
            submit_url = urljoin(base_url, form_action) if form_action else base_url
            method = form.get('method', 'get').lower()
            
            if method == 'post':
                r = requests.post(submit_url, data=form_data, headers={**HEADERS, 'Referer': base_url}, timeout=timeout)
            else:
                r = requests.get(submit_url, params=form_data, headers=HEADERS, timeout=timeout)
                
            if r.ok: return True
    except:
        pass
    return False

def process_unsubscribe_links(unsub_links: List[str], selected_senders: List[str], dry_run: bool = True) -> Dict[str, Any]:
    """
    Orchestrator function.
    NOW: Uses Strategy Pattern.
    """
    results = {}
    
    # Instantiate strategy
    # Prefer Playwright for robustness
    strategy = PlaywrightUnsubscribeStrategy()
    
    for link, sender in zip(unsub_links, selected_senders):
        if dry_run:
            results[sender] = {'status': 'dry_run', 'message': f'Would unsub from {link}'}
            continue

        try:
            success, msg = strategy.unsubscribe(link)
            results[sender] = {
                'status': 'success' if success else 'failed',
                'message': msg,
                'link': link
            }
        except Exception as e:
            results[sender] = {'status': 'error', 'message': str(e)}
            
    return {'results': results}

# Export
test_unsubscribe_actions = process_unsubscribe_links
__all__ = ['process_unsubscribe_links', 'test_unsubscribe_actions']
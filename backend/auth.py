from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
import json
import logging
import urllib.parse
from db import save_user, update_user_onboarding, get_user

# Allow OAuth scope to change (e.g. if user previously granted more access)
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

router = APIRouter(prefix="/auth", tags=["auth"])

# Configuration
# Ensure credentials.json is in the correct path (backend directory)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRETS_FILE = os.path.join(BASE_DIR, "credentials.json")

# Scopes required for the app
SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email', 
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

# Dynamic configuration helpers
def get_redirect_uri(request_host: str = None):
    """
    Determine the correct redirect URI based on the request host.
    """
    # Default to env var if set explicitly for overriding
    env_uri = os.getenv("REDIRECT_URI")
    if env_uri:
        return env_uri

    # Detect if running on Render / Production
    if request_host and "onrender.com" in request_host:
        return "https://unclut-backend.onrender.com/auth/callback"
    
    # Default to local development
    return "http://127.0.0.1:8000/auth/callback"

def get_frontend_url(request_host: str = None):
    """
    Determine the correct frontend URL based on the backend host.
    """
    env_url = os.getenv("FRONTEND_URL")
    if env_url:
        return env_url
        
    if request_host and "onrender.com" in request_host:
        return "https://unclut.vercel.app"
    
    return "http://localhost:3000"

def create_flow(redirect_uri=None):
    # Use the passed URI or fall back to default logic
    uri = redirect_uri or get_redirect_uri()

    # Priority 1: Check for credentials.json file (Local dev)
    if os.path.exists(CLIENT_SECRETS_FILE):
        return Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=uri
        )
    
    # Priority 2: Check for Environment Variables (Production / Render)
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if client_id and client_secret:
        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            }
        }
        return Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=uri
        )

    # If neither attempts work, raise error
    raise FileNotFoundError(f"Client secrets file not found at {CLIENT_SECRETS_FILE} and GOOGLE_CLIENT_ID/SECRET env vars are missing.")

@router.get("/login")
def login(request: Request):
    try:
        # Determine redirect URI based on current request header
        host = request.headers.get("host", "")
        redirect_uri = get_redirect_uri(host)
        
        flow = create_flow(redirect_uri=redirect_uri)
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        return RedirectResponse(authorization_url)
    except Exception as e:
        logging.error(f"Error creating auth flow: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize login flow")

@router.get("/callback")
def auth_callback(request: Request, code: str):
    # Determine host for logic
    host = request.headers.get("host", "")
    frontend_url = get_frontend_url(host)
    
    try:
        current_uri = get_redirect_uri(host)
        
        flow = create_flow(redirect_uri=current_uri)
        flow.fetch_token(code=code)
        
        creds = flow.credentials
        
        # Verify and get user info
        service = build('oauth2', 'v2', credentials=creds)
        user_info = service.userinfo().get().execute()
        
        email = user_info.get('email')
        if not email:
            raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

        # Convert credentials to JSON/dict for storage
        creds_json = json.loads(creds.to_json())
        
        # Save to MongoDB
        saved = save_user(user_info, creds_json)
        if not saved:
            print("WARNING: Failed to save user to DB")
        
        # Get latest user data from DB to include hasOnboarded status
        db_user = get_user(email)
        has_onboarded = db_user.get('hasOnboarded', False) if db_user else False
            
        # Store essential info in session
        request.session['user'] = {
            'email': email,
            'name': user_info.get('name'),
            'picture': user_info.get('picture'),
            'hasOnboarded': has_onboarded,
            'unsubs_count': db_user.get('unsubs_count', 0) if db_user else 0,
            'deleted_count': db_user.get('deleted_count', 0) if db_user else 0
        }
        
        # Redirect to frontend root
        return RedirectResponse(f"{frontend_url}/")
        
    except Exception as e:
        logging.error(f"Auth callback error: {e}")
        # Redirect to frontend with error details
        error_msg = urllib.parse.quote(str(e))
        return RedirectResponse(f"{frontend_url}/?error=auth_failed&details={error_msg}")

@router.get("/me")
def get_current_user_info(request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Optional: Refresh from DB to get latest status if needed
    db_user = get_user(user.get('email'))
    if db_user:
        user['hasOnboarded'] = db_user.get('hasOnboarded', False)
        user['unsubs_count'] = db_user.get('unsubs_count', 0)
        user['deleted_count'] = db_user.get('deleted_count', 0)
        # Update session with latest info
        request.session['user'] = user

    return user

@router.post("/onboarded")
def mark_user_onboarded(request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    email = user.get('email')
    if update_user_onboarding(email, True):
        # Update session immediately so frontend doesn't need to re-login
        user['hasOnboarded'] = True
        request.session['user'] = user
        return {"success": True}
    else:
        raise HTTPException(status_code=500, detail="Failed to update onboarding status")

@router.get("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

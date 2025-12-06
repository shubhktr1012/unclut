from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
import json

# Import your existing logic
# from setup_gmail_service import create_service # No longer used for global service
from email_fetcher import fetch_promotional_emails, delete_emails_from_sender, get_message_ids_for_sender
from unsub_process import process_unsubscribe_links
from extract_unsubscribe import process_email_data
from db import record_activity, get_user
from auth import router as auth_router

app = FastAPI()

# Add Session Middleware
# REPLACE 'your-secret-key' with a real secret in .env for production
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_me")
# Configure SessionMiddleware for cross-site usage (Vercel -> Render)
# same_site='none' is REQUIRED for cross-site cookies.
# https_only=True is REQUIRED when same_site='none'.
app.add_middleware(
    SessionMiddleware, 
    secret_key=SECRET_KEY, 
    same_site="none", 
    https_only=True
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://unclut.vercel.app",
    "https://unclut.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Auth Router
app.include_router(auth_router)

# No global service anymore!
# Authentication is handled strictly via get_current_user_service dependency.

# Dependency to get Gmail Service for the current user
def get_current_user_service(request: Request):
    user = request.session.get('user')
    if not user or not user.get('email'):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    email = user['email']
    user_data = get_user(email)
    
    if not user_data or 'tokens' not in user_data:
        raise HTTPException(status_code=401, detail="User tokens not found. Please login again.")
        
    try:
        creds = Credentials.from_authorized_user_info(user_data['tokens'])
        service = build('gmail', 'v1', credentials=creds)
        return service
    except Exception as e:
        print(f"Error rebuilding credentials: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials. Please login again.")

@app.get("/")
def read_root(request: Request):
    user = request.session.get('user')
    return {
        "status": "Unclut.ai Backend is running", 
        "authenticated_as": user['email'] if user else None
    }

@app.get("/scan")
def scan_inbox(max_senders: int = 10, service = Depends(get_current_user_service)):
    """
    Triggers the email scan for the logged-in user.
    """
    try:
        results = fetch_promotional_emails(service, max_senders=max_senders)
        return {"count": len(results), "emails": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UnsubscribeRequest(BaseModel):
    sender_email: str

@app.post("/unsubscribe")
def unsubscribe_sender(
    request: UnsubscribeRequest, 
    service = Depends(get_current_user_service),
    req: Request = None # To access session
):
    try:
        # 1. Fetch recent emails to find links
        messages = fetch_promotional_emails(
            service, 
            max_senders=1, 
            max_emails_to_scan=50, 
            fetch_full_content=True
        )
        
        # Targeted search
        email_ids = get_message_ids_for_sender(service, request.sender_email, max_results=10)
        
        if not email_ids:
             return {"status": "error", "message": "No emails found from this sender."}

        # Extract links
        unsub_links = []
        for msg_id in email_ids:
            msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
            processed = process_email_data(msg)
            unsub_links.extend(processed.get('unsubscribe_links', []))
            if unsub_links: break
        
        if not unsub_links:
             return {"status": "error", "message": "No unsubscribe links found."}

        # 3. Process
        result = process_unsubscribe_links(
            unsub_links=[unsub_links[0]], 
            selected_senders=[request.sender_email],
            dry_run=False
        )
        
        # Log activity
        try:
            user_info = service.users().getProfile(userId='me').execute()
            # or just use req.session['user']['email']
            current_user_email = user_info.get('emailAddress')
            
            sender_res = result.get('results', {}).get(request.sender_email, {})
            if sender_res.get('status') == 'success':
                record_activity(user_email=current_user_email, unsub_delta=1)
        except Exception as db_err:
            print(f"DB Logging Error: {db_err}")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/delete")
def delete_sender_emails(
    request: UnsubscribeRequest, 
    service = Depends(get_current_user_service)
):
    print(f"DEBUG: Delete request for {request.sender_email}")
    try:
        result = delete_emails_from_sender(service, request.sender_email, dry_run=False)
        
        # Log activity
        try:
            user_info = service.users().getProfile(userId='me').execute()
            deleted = result.get('deleted_count', 0)
            if deleted > 0:
                record_activity(user_email=user_info.get('emailAddress'), deleted_delta=deleted)
        except Exception as db_err:
            print(f"DB Logging Error: {db_err}")
            
        return result
    except Exception as e:
        print(f"DEBUG: Exception in delete: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/unsubscribe_and_delete")
def unsubscribe_and_delete(
    request: UnsubscribeRequest, 
    service = Depends(get_current_user_service),
    req: Request = None
):
    # We cannot call the endpoint functions directly because they depend on Depends()
    # But we passed `service` so we can call the helper logic directly or refactor.
    # To keep it simple, we'll re-implement the orchestration here using the passed service
    # OR we can just call them if we refactor logic out of the route handler.
    # Refactoring is safer.
    
    # 1. Unsub Logic (Inline for now to avoid Dependency injection mess in direct calls)
    # Actually, let's just do the sub-calls. `unsubscribe_sender` expects `service` as argument now!
    unsub_result = unsubscribe_sender(request, service, req)
    
    # 2. Delete Logic
    delete_result = delete_sender_emails(request, service)
    
    return {
        "unsubscribe": unsub_result,
        "delete": delete_result
    }
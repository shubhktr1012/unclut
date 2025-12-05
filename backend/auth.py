from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import json
from db import save_user

router = APIRouter(prefix="/auth", tags=["auth"])

# Allow non-HTTPS for local dev
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

CLIENT_SECRETS_FILE = "credentials.json"
SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

def get_flow(request: Request):
    """
    Constructs the OAuth2 flow.
    Dynamically sets the redirect_uri based on the request host (localhost vs production).
    """
    # Determine base URL from the request
    # Only useful if we are behind a proxy that forwards headers correctly, 
    # but for localhost/render it usually works. 
    # Fallback to hardcoded if needed.
    
    # In production (Render), we might need to be careful about http vs https 
    # if SSL termination happens at the load balancer.
    # Starlette's request.url_for should handle this if configured with ProxyHeadersMiddleware.
    
    redirect_uri = str(request.url_for('auth_callback'))
    # Ensure HTTPS in production if not automatic
    if "onrender.com" in redirect_uri and redirect_uri.startswith("http://"):
        redirect_uri = redirect_uri.replace("http://", "https://", 1)
        
    return Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )

@router.get("/login")
def login(request: Request):
    flow = get_flow(request)
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent' # Force consent to get refresh token
    )
    
    response = RedirectResponse(authorization_url)
    # Store state to verify callback
    request.session['state'] = state
    return response

@router.get("/callback")
def auth_callback(request: Request):
    state = request.session.get('state')
    
    if not state:
         raise HTTPException(status_code=400, detail="State not found in session")
         
    flow = get_flow(request)
    try:
        flow.fetch_token(authorization_response=str(request.url))
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Failed to fetch token: {str(e)}")

    creds = flow.credentials
    
    # Fetch user info to identify them
    try:
        service = build('oauth2', 'v2', credentials=creds)
        user_info = service.userinfo().get().execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")
        
    # Serialize credentials to store in DB
    # We need to store everything required to rebuild Credentials object
    creds_json = json.loads(creds.to_json())
    
    # Save to MongoDB
    saved = save_user(user_info, creds_json)
    if not saved:
        print("WARNING: Failed to save user to DB")
        
    # Store essential info in session
    request.session['user'] = {
        'email': user_info.get('email'),
        'name': user_info.get('name'),
        'picture': user_info.get('picture')
    }
    
    # Redirect to frontend
    # Maintain the same hostname (localhost vs 127.0.0.1) to ensure cookies work
    base_host = request.url.hostname
    
    frontend_port = "3000"
    if base_host == "127.0.0.1":
        frontend_url = f"http://127.0.0.1:{frontend_port}"
    elif base_host == "localhost":
        frontend_url = f"http://localhost:{frontend_port}"
    else:
        # Production fallback
        frontend_url = "https://unclut.vercel.app"
        
    if "onrender.com" in str(request.base_url):
         frontend_url = "https://unclut.vercel.app" 
         
    return RedirectResponse(frontend_url)

@router.get("/me")
def get_current_user_info(request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.get("/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError
from google.oauth2.credentials import Credentials

# If modifying these scopes, delete the file token.pickle.
SCOPES = [
    'https://mail.google.com/',  # Full access to the account including sending, reading, and deleting emails
    'https://www.googleapis.com/auth/userinfo.email', # Permission to see your primary email address
    'openid'
]

def create_service():
    creds = None
    
    # 1. Try to load from Environment Variables (Production Way)
    if os.getenv("GOOGLE_REFRESH_TOKEN"):
        try:
            creds = Credentials(
                None, # No access token needed, it will refresh automatically
                refresh_token=os.getenv("GOOGLE_REFRESH_TOKEN"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=os.getenv("GOOGLE_CLIENT_ID"),
                client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                scopes=SCOPES
            )
            return build('gmail', 'v1', credentials=creds)
        except Exception as e:
            print(f"Error loading credentials from environment: {e}")
            # Fallback to local file if env vars fail

    # 2. Fallback to local file (Development Way)
    token_path = 'token.pickle'
    creds_path = 'credentials.json'

    # Load saved credentials
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)

    # If no valid credentials, go through OAuth flow
    if not creds or not creds.valid:
        new_flow_required = True
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                new_flow_required = False 
            except RefreshError:
                print("Token refresh failed. Deleting old token and re-authenticating")
                if os.path.exists(token_path):
                    os.remove(token_path)

        if new_flow_required:
            if not os.path.exists(creds_path):
                 raise FileNotFoundError(f"Could not find {creds_path} for local authentication.")
            
            flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save credentials
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)

    service = build('gmail', 'v1', credentials=creds)
    return service
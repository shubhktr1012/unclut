from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# Import your existing logic
from setup_gmail_service import create_service
from email_fetcher import fetch_promotional_emails
# You might need to adjust imports if these files are in the same directory

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https:unclut.vercel.app",
    "https://unclut.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gmail Service (Global or per-request depending on auth flow)
# For a simple local app, we can try to get it on startup
service = None

@app.on_event("startup")
async def startup_event():
    global service
    try:
        # This uses your existing credentials.json/token.pickle logic
        service = create_service()
    except Exception as e:
        print(f"Failed to initialize Gmail service: {e}")

@app.get("/")
def read_root():
    return {"status": "Unclut.ai Backend is running", "service_connected": service is not None}

@app.get("/scan")
def scan_inbox(max_senders: int = 10):
    """
    Triggers the email scan using your existing email_fetcher logic.
    """
    if not service:
        raise HTTPException(status_code=503, detail="Gmail service not connected")
    
    try:
        # Re-using your existing function
        results = fetch_promotional_emails(service, max_senders=max_senders)
        return {"count": len(results), "emails": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example of an action endpoint
class UnsubscribeRequest(BaseModel):
    sender_email: str

@app.post("/unsubscribe")
def unsubscribe_sender(request: UnsubscribeRequest):
    # Connect to your unsub_process.py logic here
    return {"status": "Not implemented yet", "target": request.sender_email}
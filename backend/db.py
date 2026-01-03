import os
from datetime import datetime, UTC
import logging
from dotenv import load_dotenv # Added this line

load_dotenv() # Added this line to load environment variables from .env

try:
	from pymongo import MongoClient
	from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError # Import specific exceptions
except ImportError:
	MongoClient = None
except Exception as e: # Catch any other unexpected import errors
    print(f"ERROR: Failed to import pymongo: {e}")
    MongoClient = None

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "unclut")
COLLECTION = os.getenv("MONGODB_COLLECTION", "users")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def _get_collection():
	if not (MONGO_URI and MongoClient):
		return None
	try:
		client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
		client.admin.command('ismaster')
		db = client[DB_NAME]
		logging.info(f"Successfully connected to MongoDB database: {DB_NAME}")
		return db[COLLECTION]
	except (ConnectionFailure, ServerSelectionTimeoutError) as e:
		logging.error(f"MongoDB connection failed: {e}. Please check your MONGODB_URI and Network Access in Atlas.")
		return None
	except Exception as e:
		logging.error(f"An unexpected error occurred during MongoDB connection setup: {e}")
		return None

def record_activity(user_email: str, unsub_delta: int = 0, deleted_delta: int = 0) -> None:
	if not user_email or (unsub_delta == 0 and deleted_delta == 0):
		return
	coll = _get_collection()
	if coll is None:
		return
	now = datetime.now(UTC)
	update = {
		"$setOnInsert": {
			"email": user_email,
			"createdAt": now,
		},
		"$inc": {
			"unsubs_count": max(0, int(unsub_delta)),
			"deleted_count": max(0, int(deleted_delta))
		},
		"$set": {"updatedAt": now}
	}
	try:
		result = coll.update_one({"_id": user_email}, update, upsert=True)
		if result.upserted_id:
			logging.info(f"New user {user_email} added to database.")
		elif result.modified_count:
			logging.info(f"Updated activity for {user_email}. Unsub: {unsub_delta}, Deleted: {deleted_delta}.")
		else:
			logging.info(f"Activity record operation for {user_email} completed with no changes (dry run or no new activity).")
	except Exception as e:
		logging.error(f"Failed to record activity for {user_email} in MongoDB: {e}")

def save_user(user_info: dict, credentials: dict) -> bool:
    """
    Save user info and credentials to MongoDB.
    """
    if not user_info.get('email'):
        return False
        
    coll = _get_collection()
    if coll is None:
        return False
        
    email = user_info['email']
    now = datetime.now(UTC)
    
    # Prepare the update document
    update_data = {
        "$set": {
            "email": email,
            "name": user_info.get('name'),
            "picture": user_info.get('picture'),
            "updatedAt": now,
            # Store credentials securely
            "tokens": credentials # In a real app, encrypt this!
        },
        "$setOnInsert": {
            "createdAt": now,
            "unsubs_count": 0,
            "deleted_count": 0,
            "hasOnboarded": False  # Default to False for new users
        }
    }
    
    try:
        coll.update_one({"_id": email}, update_data, upsert=True)
        logging.info(f"User {email} saved/updated in database.")
        return True
    except Exception as e:
        logging.error(f"Failed to save user {email}: {e}")
        return False

def update_user_onboarding(email: str, status: bool = True) -> bool:
    """
    Update the hasOnboarded status for a user.
    """
    coll = _get_collection()
    if coll is None:
        return False
        
    try:
        coll.update_one(
            {"_id": email},
            {"$set": {"hasOnboarded": status, "updatedAt": datetime.now(UTC)}}
        )
        return True
    except Exception as e:
        logging.error(f"Failed to update onboarding status for {email}: {e}")
        return False

def get_user(email: str) -> dict:
    """
    Retrieve user by email.
    """
    coll = _get_collection()
    if coll is None:
        return None
    return coll.find_one({"_id": email})

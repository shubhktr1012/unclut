1. The Entry Points (Frontend/Client)
	- Web App: frontend/app.page.tsx
		- Built with Next.js
		- Main landing page logic.
	- CLI Tool: backend/cli_menu.py
		-  Interactive terminal menu for manual bulk operations.
	- Backend API: backend/main.py
		- FastAPI application serving the frontend and handling API requests.
		
2.  The Compute (backend/logic)
	- Framework: Python (FastAPI)
	- Core Business Logic: 
		- backend/email_fetcher.py: Interacts with Gmail to fetch, filter, and delete emails.
		- backend/unsub_process.py & backend/extract_unsubscribe.py: Logic to find and execute unsubscribe links.
		- backend/auth.py: Handles Google OAuth2 authentication flow. 
3. The Storage (Databases/Files)
	- Database: MongoDB
		- Managed via backend/db.py
		- Stores user profiles, authentication tokens, activity stats
	- Local FIles: 
		- backend/credentials.json: OAuth client secrets
		- backend/unsubscribe.loh: Local log file for unsubscribe actions

4. The External World (APIs/Integrations)
	- Gmail API: Primary Integration for reading and managing the user's inbox.
	- Google OAuth 2.0: Handles user login and permissions via google-auth-oauthlib.
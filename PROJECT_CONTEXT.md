# Project Context: Unclut.ai

## 1. Overview
**Unclut.ai** is a full-stack web application designed to help users clean their Gmail inboxes. It focuses on identifying promotional emails, aggregating them by sender, and empowering users to bulk-unsubscribe and delete unwanted emails with a single click.

The project has transitioned from a CLI tool/extension concept into a fully functional **modern web application**.

## 2. Architecture
The project follows a **Monorepo** structure:

1.  **Frontend (`/frontend`)**: Next.js (React) application serving the UI.
2.  **Backend (`/backend`)**: Python FastAPI application acting as the logic core and Gmail API interface.
3.  **Legacy Extension (`/legacy-extension`)**: The original Chrome Extension MVP (Reference only).

### Data Flow
1.  **Auth**: User logs in via Google OAuth on the Frontend -> Backend handles token exchange and establishes a session.
2.  **Scan**: User initiates a scan -> Backend requests Gmail API for `category:promotions` -> Returns aggregated sender data.
3.  **Action**: User selects "Unsubscribe" or "Delete" -> Backend executes Gmail API calls (modify labels, trash threads) and attempts to automate unsubscribing via headers/links.

---

## 3. Component: Frontend (`/frontend`)
**Purpose**: The consumer-facing interface.

### Tech Stack
-   **Framework**: Next.js 16 (React 19)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS 4
-   **Linting**: ESLint

### Key Structures
-   **Pages/App Router**:
    -   Landing Page (Hero, "Get Started").
    -   Dashboard/Scan View (Email list display).
-   **Components (`/components`)**:
    -   `Navbar`, `Footer`, `Hero`: Core layout.
    -   `EmailList`: Displays the scan results.
    -   `ConfirmationModal`: Handles user confirmation for destructive actions.
    -   `Toast`: Notifications for success/error states.

---

## 4. Component: Backend (`/backend`)
**Purpose**: The "Unsub Engine" and API layer.

### Tech Stack
-   **Framework**: FastAPI
-   **Server**: Uvicorn
-   **Language**: Python 3.10+
-   **Database**: PyMongo (MongoDB) - Used for logging user activity/stats.
-   **Auth**: Google OAuth2 + Session Middleware (Signed Cookies).

### Core Endpoints & Logic (`main.py`)
-   **`/auth/*`**: Managed via `auth.py`. Handles login, callback, and logout.
-   **`/scan`**: scours the inbox for promotional emails (limit configurable via `max_senders`).
-   **`/count_emails`**: quickly estimates the volume of emails from a specific sender.
-   **`/unsubscribe`**:
    -   Fetches recent emails from the sender to find `List-Unsubscribe` headers or HTML links.
    -   Executes the unsubscribe action (POST request or mailto).
-   **`/delete`**: Moves all emails from a specific sender to Trash.
-   **`/unsubscribe_and_delete`**: Chained action for maximum cleaning.

### Key Modules
-   **`email_fetcher.py`**: Interacts with Gmail API to list and aggregate messages.
-   **`unsub_process.py`**: Parsing logic for finding 'Unsubscribe' links in HTML bodies.
-   **`extract_unsubscribe.py`**: Helper to extract links from raw message payloads.

---

## 5. Project Status & Progress

### Current Stage: functional Web MVP
The application is fully functional for its core use case: Signing in, scanning the inbox, and performing unsubscribe/delete actions.

### Completed Features (✅)
-   [x] **Google OAuth2 Integration**: Secure sign-in and token management (saved in session).
-   [x] **Inbox Scanning**: Filters for `category:promotions` and aggregates by sender.
-   [x] **Unsubscribe Engine**:
    -   Support for RFC 2369 `List-Unsubscribe` headers.
    -   HTML scraping for "unsubscribe" links in the body.
-   [x] **Bulk Deletion**: Trashing threads by sender.
-   [x] **Combined Actions**: "Unsubscribe & Delete" flow.
-   [x] **Frontend UI**:
    -   Clean, modern Landing page.
    -   Interactive list of senders.
    -   Confirmation modals for risky actions.
    -   Toast notifications for feedback.

### In Progress / Roadmap (🚧)
-   **Dockerization**: Creating robust Dockerfiles for both Frontend and Backend (Frontend Dockerfile currently in review).
-   **Deployment**: Configuring for production (Render/Vercel) - dealing with Redirect URI mismatches and Env vars.
-   **UI Polish**: Dark mode refinements (Icons, colors), better responsiveness.
-   **Robustness**: Handling more edge cases in the Unsubscribe engine (e.g., complex form fills).

---

## 6. Development & Setup

### Environment Variables
Both `frontend/.env.local` and `backend/.env` are required.
-   **Backend**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SECRET_KEY`, `FRONTEND_URL`.
-   **Frontend**: `NEXT_PUBLIC_API_URL`.

### Running Locally
1.  **Backend**:
    ```bash
    cd backend
    uvicorn main:app --reload
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

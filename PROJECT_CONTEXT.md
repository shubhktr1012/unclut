# Project Context: Unclut.ai

## 1. Overview
**Unclut.ai** is a full-stack application designed to help users clean their Gmail inboxes. It identifies promotional emails, aggregates them by sender, and allows users to bulk-unsubscribe and delete unwanted emails.

The project has evolved from a simple CLI tool into a modern web application with a **Hybrid Stack Architecture**.

## 2. Architecture
The project uses a Monorepo structure with three main components:

1.  **Frontend (`/frontend`)**: A modern web interface built with **Next.js 14+** (App Router).
2.  **Backend (`/backend`)**: A robust API built with **FastAPI** (Python) that handles Gmail API interactions.
3.  **Legacy Extension (`/legacy-extension`)**: The original Chrome Extension MVP (currently in maintenance mode).

### Data Flow
1.  **User** interacts with the Next.js Frontend.
2.  **Frontend** authenticates via OAuth 2.0 and requests data (emails, stats) from the Backend.
3.  **Backend** communicates with the **Gmail API** using the user's credentials to fetch messages and perform actions (trash, remove from lists).

---

## 3. Component: Frontend (`/frontend`)
**Purpose**: The primary user interface for Unclut.ai.

### Tech Stack
-   **Framework**: Next.js 16 (React 19)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **State Management**: React Hooks

### Key Features
-   **Landing Page**: Introductory content and "Get Started" flow.
-   **Auth Flow**: Handles Google OAuth redirection and token exchange.
-   **Dashboard**: Displays aggregated email stats and allows user control (planned/in-progress).

---

## 4. Component: Backend (`/backend`)
**Purpose**: The logic core. Handles all complex email processing, parsing, and Gmail API calls.

### Tech Stack
-   **Framework**: FastAPI
-   **Server**: Uvicorn
-   **Language**: Python 3.10+
-   **Database**: MongoDB (via PyMongo) - *Optional/Logging*

### Key Modules
-   **`main.py`**: The FastAPI entry point. Defines API endpoints (e.g., `/auth/login`, `/scan`).
-   **`auth.py`**: Handles OAuth 2.0 flow, credential validation, and session management.
-   **`email_fetcher.py`**: Scans Gmail for promotional emails using search queries (`category:promotions`, etc.).
-   **`unsub_process.py`**: The core "Unsubscribe Engine".
    -   Parses `List-Unsubscribe` headers.
    -   Scrapes HTML bodies for "unsubscribe" links.
    -   Executes specific logic for providers like SendGrid.

---

## 5. Component: Legacy Extension (`/legacy-extension`)
**Status**: Legacy / Reference.
**Purpose**: Originally designed to inject an "Unsubscribe" button directly into the Gmail UI.
**Stack**: Vanilla JS, HTML, CSS, Manifest V3.

---

## 6. Configuration & Setup
-   **Environment Variables**: Managed via `.env` files in both `frontend/` and `backend/`.
    -   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Vital for OAuth.
    -   `NEXT_PUBLIC_API_URL`: Frontend pointer to the backend.
-   **Authentication**: Uses a shared Google Cloud Project configuration.

## 7. Development Protocols
-   **Git**: Feature branch workflow.
-   **Run Locally**:
    -   Backend: `uvicorn main:app --reload` (Port 8000)
    -   Frontend: `npm run dev` (Port 3000)

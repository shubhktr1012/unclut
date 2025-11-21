# Project Context: Unclut.ai

## 1. Overview
**Unclut.ai** is a tool designed to help users clean their Gmail inboxes by identifying promotional emails, unsubscribing from mailing lists, and bulk-deleting unwanted emails. The project aims to reclaim inbox space and reduce digital clutter.

It currently consists of two main components:
1.  **Unclut CLI**: A robust Python-based command-line tool for batch processing.
2.  **Chrome Extension**: A browser extension for inline inbox management (currently in MVP phase).

## 2. Architecture
The project is split into two distinct directories:
-   `unclut-cli/`: Contains the Python application logic, interacting directly with Gmail API.
-   `chrome-extension/`: Contains the Javascript/HTML/CSS for the browser extension, interacting with the Gmail DOM and API.

Both components rely on the **Gmail API** and **OAuth 2.0** for user authentication and data access.

## 3. Component: Unclut CLI (`unclut-cli/`)

### Purpose
To provide a powerful, batch-oriented tool for deep cleaning the inbox. It scans for older promotional emails, aggregates them by sender, and allows the user to take bulk actions.

### Tech Stack
-   **Language**: Python 3.8+
-   **API**: Google Gmail API (via `google-api-python-client`)
-   **Auth**: OAuth 2.0 (via `google-auth-oauthlib`)
-   **HTML Parsing**: `BeautifulSoup4`
-   **HTTP Requests**: `requests` library
-   **Database**: MongoDB (Optional, for activity logging)

### Key Workflows & Implementation

#### 1. Authentication (`setup_gmail_service.py`)
-   Uses `credentials.json` (OAuth client ID) to authenticate.
-   Stores user tokens locally in `token.pickle` for persistent sessions.
-   Scopes: `https://www.googleapis.com/auth/gmail.modify`.

#### 2. Scanning & Discovery (`email_fetcher.py`)
-   **Query**: Scans for emails matching `category:promotions older_than:14d -category:updates -category:social -category:forums`.
-   **Optimization**: Fetches message metadata (ID, ThreadID, Headers) first to minimize data transfer.
-   **Aggregation**: Groups emails by unique sender (extracted from `From` header).

#### 3. Unsubscribe Logic (`extract_unsubscribe.py`, `unsub_process.py`)
-   **Link Extraction**:
    -   Parses the `List-Unsubscribe` header.
    -   Scans email body (HTML) for keywords like "unsubscribe", "preferences", "opt-out".
    -   Handles `mailto:` links.
-   **Action Execution**:
    -   **GET Requests**: Visits the extracted link.
    -   **SendGrid Support**: Specifically handles SendGrid links which often require POST requests.
    -   **Form Submission**: If a simple visit doesn't confirm unsubscription, it parses the page for forms (looking for "confirm", "submit" buttons) and attempts to submit them.
    -   **Verification**: Checks response text for success keywords ("successfully unsubscribed", "updated").

#### 4. Deletion Logic (`email_fetcher.py`)
-   Uses `users.messages.batchDelete` endpoint to delete emails in chunks of 1000 (API limit).

#### 5. User Interface (`cli_menu.py`)
-   Interactive terminal menu using `input()` loop.
-   Displays numbered list of senders.
-   Supports "Dry Run" mode to preview actions without execution.

## 4. Component: Chrome Extension (`chrome-extension/`)

### Purpose
To provide a seamless, "native" experience within the Gmail web interface, allowing users to unsubscribe/delete directly from the email list view.

### Tech Stack
-   **Platform**: Chrome Extension (Manifest V3)
-   **Core**: JavaScript (Vanilla), HTML, CSS

### Implementation Details

#### 1. Content Script (`contentScript.js`)
-   **Injection**: Injects a "⸸" button next to sender names in the Gmail list view (`tr[role="row"]`).
-   **SPA Handling**: Uses `MutationObserver` and hooks into `history.pushState`/`replaceState` to handle Gmail's Single Page Application navigation and dynamic content loading.
-   **UI**:
    -   Displays a dropdown menu on click: "Unsubscribe", "Delete All", "Unsubscribe + Delete".
    -   Shows a "Toast" notification at the bottom of the screen for feedback (Success/Error/Undo).
-   **Communication**: Sends messages to `background.js` to perform the actual API calls (logic currently being migrated/connected).

#### 2. Background Script (`background.js`)
-   Handles the OAuth flow and Gmail API requests (similar to the CLI but in JS).
-   Listens for messages from `contentScript.js`.

## 5. Configuration
-   **CLI**: Uses `.env` file for settings:
    -   `MAX_SENDERS`: Limit number of senders to show.
    -   `MAX_EMAILS_TO_SCAN`: Limit scan depth.
    -   `DRY_RUN`: Toggle safety mode.
    -   `MONGODB_URI`: Database connection string.

## 6. Future Roadmap (from `project_systems/PROJECT_PLAN.md`)
-   **Immediate**: Polish the Chrome Extension (Phase 1 & 2).
-   **Features**:
    -   AI Summaries of sender history.
    -   "Confidence Score" for mailing lists.
    -   Daily cleaning tips.
    -   Better handling of complex unsubscribe flows.

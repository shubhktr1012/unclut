# Unclut.ai - Gmail Cleaner & Unsubscriber

Unclut.ai is a comprehensive tool suite designed to help you reclaim your Gmail inbox. It intelligently scans for promotional emails, allows you to select senders, and automates the process of unsubscribing and bulk-deleting unwanted emails.

![Unclut AI](assets/unclut-ai.png)

## 📂 Project Structure

This is a monorepo containing the following components:

-   **`backend/`**: A FastAPI-based backend service that handles Gmail API interactions, email scanning, and unsubscription logic.
-   **`frontend/`**: A Next.js web application serving as the user interface for the tool.
-   **`chrome-extension/`**: A browser extension for inline inbox management (MVP).
-   **`unclut-cli/`**: The original command-line interface tool for batch processing.

---

## 🚀 Getting Started

### Prerequisites

-   Python 3.8+
-   Node.js 18+
-   Google Cloud Project with Gmail API enabled

### 1. Backend Setup (FastAPI)

The backend powers the web app and handles all API logic.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Authentication Setup**:
    -   Place your `credentials.json` from Google Cloud Console in the `backend/` folder.
    -   Run the app locally once to generate `token.pickle` (browser login required):
        ```bash
        uvicorn main:app --reload
        ```
    -   **Production**: Set `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` environment variables.

4.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup (Next.js)

The frontend provides a modern web interface for scanning and cleaning your inbox.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

### 3. CLI Tool (Legacy)

For those who prefer the terminal.

1.  Navigate to the CLI directory:
    ```bash
    cd unclut-cli
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the tool:
    ```bash
    python main.py
    ```

### 4. Chrome Extension

1.  Open Chrome and go to `chrome://extensions/`.
2.  Enable **Developer mode**.
3.  Click **Load unpacked** and select the `chrome-extension/` folder.

---

## ☁️ Deployment

### Backend (Render)
The backend is configured for deployment on Render.
-   **Build Command**: `pip install -r requirements.txt`
-   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
-   **Environment Variables**: Ensure `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` are set.

### Frontend (Vercel)
The frontend is optimized for Vercel.
-   Connect your repository to Vercel.
-   It will automatically detect the Next.js project in `frontend/`.

---

## ✨ Features

-   **Smart Scanning**: Identifies promotional emails older than 14 days.
-   **Bulk Actions**: Unsubscribe and delete emails in one go.
-   **Modern UI**: Clean web interface for easy management.
-   **Secure**: Uses official Gmail API with OAuth 2.0.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
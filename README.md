# unClut.ai | Full Stack AI Email Assistant

![unClut.ai Banner](assets/unclut-ai.png)

### A production-ready web application that helps users declutter their Gmail inboxes using AI-driven scanning and smart unsubscribe logic.

<div align="center">

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
  [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

  <h3>
    <a href="https://unclut.vercel.app">🔴 Live Demo (Vercel)</a>
    <span> | </span>
    <a href="https://unclut-backend.onrender.com/docs">API Docs</a>
    <span> | </span>
    <a href="https://github.com/YOUR_GITHUB_USERNAME/unclut-ai">View Code</a>
  </h3>
</div>

---

## 🏗 System Architecture

This project utilizes a **Monorepo Architecture** to manage a Hybrid Stack application. It demonstrates secure cross-origin communication between a modern Node.js frontend and a robust Python backend.



[Image of full stack web application architecture]


| Component | Tech Stack | Deployment | Live URL |
|-----------|------------|------------|----------|
| **Frontend** | Next.js 14 (App Router), TypeScript | **Vercel** | [unclut.vercel.app](https://unclut.vercel.app) |
| **Backend** | Python FastAPI, Uvicorn | **Render** | [unclut-backend.onrender.com](https://unclut-backend.onrender.com) |
| **Auth** | OAuth 2.0 | - | Secure Token Management & Scope handling. |

---

## 🚀 Key Features

* **Hybrid Connectivity:** Seamless integration between Next.js (Frontend) and Python (Backend) using REST endpoints.
* **Smart Unsubscribe Engine:** Unlike standard tools that just delete emails, this engine parses `List-Unsubscribe` headers and scrapes HTML bodies to find "Opt-Out" links programmatically.
* **Real-Time Scanning:** Fetches and categorizes promotional emails live from the user's Gmail account.
* **Secure CORS Configuration:** Configured middleware to allow secure communication between Vercel (Frontend) and Render (Backend).

---

## 📂 Project Structure

This monorepo contains the following packages:

-   `frontend/`: The Next.js client-side application.
-   `backend/`: The FastAPI server and Python logic.
-   `chrome-extension/`: *(Legacy)* An MVP browser extension for inline management.

---

## 🛠️ Getting Started Locally

### Prerequisites
-   Node.js 18+
-   Python 3.9+
-   Google Cloud Console Credentials (`credentials.json`)

### 1. Backend Setup (Python)

```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run Server
uvicorn main:app --reload
```

The API will be available at http://127.0.0.1:8000

### 2. Frontend Setup (Next.js)
```
cd frontend
# Install dependencies
npm install

# Run Development Server
npm run dev
```

The App will be available at http://localhost:3000

## 🔧 Environment Variables

To run this project, you will need to set up the following environment variables in your .env file or Deployment settings:
```GOOGLE_CLIENT_ID``` ```GOOGLE_CLIENT_SECRET``` ```GOOGLE_REFRESH_TOKEN```

## 🤝 Contributing

Contributions are welcome! This project follows a standard Feature Branch workflow:
1. Create a branch (```git checkout -b feature/AmazingFeature```)
2. Commit your changes (```git commit -m 'feat: Add some AmazingFeature'```)
3. Push to the branch (```git push origin feature/AmazingFeature```)
4. Open a Pull Request

## 📜 License

Distributed under the MIT License. See LICENSE for more information.

### ⚡ Action:
1.  **Paste** this into your `README.md`.
2.  **Change** `YOUR_GITHUB_USERNAME` (near the top) to your actual username.
3.  **Commit & Push.**

Once you push this, you have officially **Finished Pillar 1** of the Unfuck Protocol. You exist. You are visible. You are hireable.

**Are you ready to send the first "Trojan Horse" application?**

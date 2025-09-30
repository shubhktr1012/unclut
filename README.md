# Unclut - Gmail Unsubscriber & Cleaner

Unclut is a powerful command-line tool designed to help you reclaim your Gmail inbox. It intelligently scans for promotional emails, allows you to select senders, and then automates the process of unsubscribing from them and bulk-deleting their emails.

![Screenshot of the Unclut CLI menu in action](assets/unclut-ai.png)
*(Feel free to replace the image URL above with a screenshot of the tool)*

## ✨ Features

-   **Interactive & Easy to Use**: A simple, clean command-line menu to guide you.
-   **Intelligent Email Discovery**: Automatically fetches and lists unique senders from your promotional emails.
-   **Flexible Actions**: Choose to:
    -   Unsubscribe from selected senders.
    -   Bulk-delete all emails from selected senders.
    -   Do both at once for a total cleanup.
-   **Automated Unsubscription**: Intelligently processes unsubscribe links, including those requiring form submissions.
-   **Safe Dry Run Mode**: Preview the actions the tool will take without making any actual changes to your inbox.
-   **Activity Tracking (Optional)**: Connect to a MongoDB database to keep a record of your cleanup activity.

## ⚙️ How It Works

The tool uses the official Gmail API to securely access your account.

1.  **Authentication**: On first use, it authenticates via Google's OAuth 2.0 flow, storing a token locally and securely for future sessions.
2.  **Scanning**: It scans your inbox for emails labeled as promotions, focusing on older emails to identify long-term clutter.
3.  **Sender Selection**: It presents you with a numbered list of unique senders from the promotional emails it found.
4.  **Link Extraction**: For the senders you select, it finds the most recent email and extracts the unsubscribe link from either the `List-Unsubscribe` header or the email's body.
5.  **Action Execution**:
    -   **Unsubscribe**: It visits the unsubscribe link, attempts to confirm the action, and can even handle basic confirmation forms.
    -   **Delete**: It efficiently finds all emails from the selected sender and performs a batch deletion.

## 🚀 Getting Started

Follow these steps to get the Unclut CLI running on your local machine.

### Prerequisites

-   Python 3.8+
-   `pip` (Python package installer)

### 1. Set Up Google Cloud Project & Gmail API

To use the Gmail API, you need to configure a project in the Google Cloud Console.

1.  **Create a Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2.  **Enable the Gmail API**: In your new project, go to "APIs & Services" > "Library", search for "Gmail API", and enable it.
3.  **Configure OAuth Consent Screen**: Go to "APIs & Services" > "OAuth consent screen".
    -   Choose **External** user type.
    -   Fill in the required app information (app name, user support email, developer contact).
    -   On the "Scopes" page, you don't need to add any scopes.
    -   On the "Test users" page, add the Google account email you want to clean up.
4.  **Create Credentials**:
    -   Go to "APIs & Services" > "Credentials".
    -   Click "Create Credentials" > "OAuth client ID".
    -   Select **Desktop app** as the application type.
    -   Give it a name (e.g., "Unclut CLI").
    -   Click "Create". A modal will appear with your Client ID and Secret. Click **Download JSON**.
5.  **Add Credentials to Project**:
    -   Rename the downloaded file to `credentials.json`.
    -   Place this file inside the `unclut-cli/` directory.

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd unclut
```

### 3. Install Dependencies

Install the required Python packages using the `requirements.txt` file.

```bash
pip install -r unclut-cli/requirements.txt
```

### 4. Configure Environment Variables

The tool is configured using a `.env` file.

1.  Create a file named `.env` inside the `unclut-cli/` directory.
2.  Copy and paste the following content into it, adjusting the values as needed.

```env
# The maximum number of unique senders to display in the menu.
MAX_SENDERS=50

# The maximum number of recent emails to scan to find senders.
MAX_EMAILS_TO_SCAN=200

# Set to "true" to run in dry run mode (no actual unsubscribing or deleting).
# Highly recommended for the first run!
DRY_RUN=true

# --- Optional: MongoDB for Activity Tracking ---
# Your MongoDB connection string. If left blank, database logging is disabled.
# MONGODB_URI="mongodb+srv://..."
# MONGODB_DB="unclut_prod"
# MONGODB_COLLECTION="users"
```

## ▶️ Usage

1.  Navigate to the command-line tool's directory:
    ```bash
    cd unclut-cli
    ```
2.  Run the main script:
    ```bash
    python main.py
    ```
3.  **First-time Authentication**: The first time you run it, a browser window will open asking you to log in to your Google account and grant the app permission. After you approve, a `token.pickle` file will be saved in the directory for future use.
4.  **Follow the Menu**: Once authenticated, the main menu will appear. Just follow the on-screen prompts to start cleaning your inbox!

## 🔧 Configuration

You can customize the tool's behavior by editing the `unclut-cli/.env` file:

-   `MAX_SENDERS`: Controls how many sender options you get in the selection list.
-   `MAX_EMAILS_TO_SCAN`: A higher number means a more thorough scan for promotional senders, but it may take longer.
-   `DRY_RUN`: Set to `true` to see what the script *would* do without it actually doing anything. Set to `false` to perform the real actions.
-   `MONGODB_URI`: If you want to log activity, provide your full MongoDB connection string here. If this is empty, no database connection will be attempted.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## 📄 License

This project is not licensed. Please add a license file.
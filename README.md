# 📬 MailLens – AI Email Summaries for Gmail

MailLens is a Chrome extension that lets you **summarize long Gmail threads with one click**.  
It works directly inside Gmail and supports **short, bullet, and detailed summaries**, designed for clarity and speed.

This project is built as a **portfolio-grade, production-ready system**, distributed via GitHub (no Chrome Web Store fee required).

---

## Features

-  **One-click summarization** inside Gmail
-  Three summary modes:
   -  **Short** – quick overview
   -  **Bullets** – key points
   -  **Detailed** – short + bullets + full explanation
-  Works on entire email threads
-  Clean, draggable, resizable in-page UI
-  Secure Google authentication
-  Backend-only AI access (no keys in browser)
-  Per-thread caching for faster reuse

---

## How It Works

```
            Gmail Page
                ↓
Chrome Extension (UI + email extraction)
                ↓
    Backend API (Auth + AI proxy)
                ↓
            AI Summary
                ↓
        Shown inside Gmail
```

-  The extension **never stores emails**
-  AI keys are **never exposed to the browser**
-  All summarization happens server-side

---

## Tech Stack

### Extension

-  Chrome Extension (Manifest v3)
-  Vanilla JavaScript
-  Gmail DOM extraction
-  `chrome.identity` for Google authentication

### Backend

-  Node.js + Express
-  TypeScript
-  JWT-based session handling
-  AI API (server-side only)
-  Deployed on [**Render**](https://mail-lens.onrender.com)

---

## Authentication Model

1. User signs in via Google (Chrome identity)
2. Backend verifies the Google access token
3. Backend issues its own session token (JWT)
4. Extension uses this token for all API calls

✔ No Google token reuse
✔ No client-side secrets
✔ Stateless backend

---

## Repository Structure

```
mail-lens/
├── backend/    # Node.js + Express backend
├── extension/  # Chrome extension (content + background scripts)
└── README.md
```

---

## Backend (Live)

Backend base URL:
[https://mail-lens.onrender.com](https://mail-lens.onrender.com)

Health check:

```
GET /health
→ { "status": "ok" }
```

---

## Install the Extension

MailLens is distributed via GitHub and installed using Chrome Developer Mode.

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/ksidharth8/mail-lens.git
   ```

2. Open Chrome and go to:

   ```
   chrome://extensions
   ```

3. Enable **Developer mode** (top-right)

4. Click **Load unpacked**

5. Select the `extension/` folder from the cloned repo

6. Open Gmail and click the **MailLens** icon

The extension will now run locally like a store-installed extension.

---

## Usage

1. Open a Gmail email thread
2. Click the **MailLens** icon
3. Choose a summary type:

   -  Short
   -  Bullets
   -  Detailed

4. Click **Summarize**
5. Switch summary types instantly (cached per thread)

---

## Prompt Design (Key Highlight)

MailLens uses **strict output contracts** to ensure reliable UI rendering:

-  **Short** → 1–3 sentences
-  **Bullets** → 3–5 bullet points using `•`
-  **Detailed** →
   -  Short summary
   -  Bullet key points
   -  Full explanation

This avoids unpredictable formatting and keeps the UI stable.

---

## Security & Privacy

-  Emails are processed **only on demand**
-  No email content is stored
-  No AI keys in the browser
-  Minimal Chrome permissions
-  Auth tokens stored locally only

---

## Implementation Highlights

This project demonstrates:

-  Real-world Chrome extension architecture
-  Secure auth with backend sessioning
-  Clean separation of concerns
-  Prompt engineering with deterministic outputs
-  Production backend deployment
-  Practical Gmail DOM handling

---

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, features, or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

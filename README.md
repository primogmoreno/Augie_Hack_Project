# FinLit — Financial Literacy Companion

A financial literacy web app built for HackAugie 2026. FinLit connects users to their real bank data via Plaid, analyzes their spending with Google Gemini AI, and benchmarks their interest rates against NCUA national averages — so they can have smarter conversations with their credit union.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Yarn](https://classic.yarnpkg.com/en/docs/install) v1 (classic)

---

## Getting API Keys

| Key | Where to get it | Notes |
|---|---|---|
| `PLAID_CLIENT_ID` + `PLAID_SECRET` | [dashboard.plaid.com](https://dashboard.plaid.com) | Create a free account, use **Sandbox** environment |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | Free tier — no billing required |

---

## Setup

**1. Clone the repo**
```bash
git clone <repo-url>
cd Augie_Hack_Project
```

**2. Create your `.env` file**

Open `.env` and fill in your keys:
```
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox
GEMINI_API_KEY=your_gemini_key_here
PORT=5000
SESSION_SECRET=any-random-string
```

**3. Install all dependencies**
```bash
yarn install
```

**4. Start the app**
```bash
yarn dev
```

This starts both the backend (port `5000`) and the frontend (port `3000`) concurrently. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Plaid Sandbox Test Credentials

When the Plaid Link modal appears, use these test credentials to connect a fake bank account:

- **Username:** `user_good`
- **Password:** `pass_good`

---

## Project Structure

```
/client       React + Vite + Tailwind frontend
/server       Node.js + Express backend
.env          Your local environment variables (never committed)
.env.example  Key names template — copy this to .env
```

### Key frontend components

| File | Purpose |
|---|---|
| `client/src/pages/Home.jsx` | Landing page + Plaid Link button |
| `client/src/pages/Dashboard.jsx` | Main dashboard after bank connection |
| `client/src/components/dashboard/RateRealityCheck.jsx` | NCUA rate comparison chart |
| `client/src/components/analyzer/SpendingAnalyzer.jsx` | Gemini AI spending analysis |
| `client/src/components/plaid/PlaidLinkButton.jsx` | Plaid Link flow handler |
| `client/src/services/api.js` | Axios client (proxied to `:5000`) |

### Key backend routes

| Endpoint | Description |
|---|---|
| `POST /api/plaid/create-link-token` | Generate Plaid Link token |
| `POST /api/plaid/exchange-token` | Exchange public token for access token |
| `GET  /api/plaid/accounts` | Fetch account balances and APRs |
| `GET  /api/plaid/transactions` | Fetch last 90 days of transactions |
| `GET  /api/rates/ncua` | Return cached NCUA rate data |
| `POST /api/gemini/analyze-spending` | Gemini spending analysis |
| `POST /api/gemini/decode-jargon` | Plain-English term decoder |
| `POST /api/gemini/chat` | Credit union advisor chatbot |

---

## Other Scripts

```bash
yarn build    # Build the React frontend for production
yarn start    # Start the Express server only (production)
```

---

## Security Notes

- The Plaid `access_token` is never sent to the frontend — all Plaid calls happen server-side.
- No financial data is written to a database. Everything lives in server-side session memory only.
- Never commit your `.env` file. It is excluded via `.gitignore`.

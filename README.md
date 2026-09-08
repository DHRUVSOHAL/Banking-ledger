A production-grade, full-stack **core banking ledger application** built with **React (Vite)**, **Node.js/Express**, and **MongoDB**. The platform enforces double-entry bookkeeping principles, atomic financial transactions, cryptographic idempotency, role-based approval thresholds, and a 3-step OTP-based account recovery protocol.

---

## 🌟 Key Architecture & Highlights

- **Double-Entry Bookkeeping** — Every deposit and transfer strictly balances equal and opposite `DEBIT` and `CREDIT` entries in an immutable audit ledger.
- **Idempotency & Concurrency Control** — Prevents double-spending and duplicate requests on network retries using unique client-generated UUID idempotency keys.
- **Auto-Approval Threshold Engine**
  - Deposits **≤ ₹50,000** → verified and credited immediately via automated system accounts.
  - Deposits **> ₹50,000** → held in a `PENDING` queue awaiting dual-control verification by an authorized system admin.
- **Enterprise Authentication & Session Security**
  - Stateless JWTs wrapped in cross-domain, hardened `HttpOnly` cookies (`SameSite=None`, `Secure=True`).
  - Active session revocation via MongoDB Token Blacklisting.
  - Granular Role-Based Access Control (RBAC) protecting customer accounts from admin interfaces.
- **Cryptographic 3-Step Password Recovery** — Multi-factor reset lifecycle using salt-hashed OTPs and signed temporary recovery tokens.
- **Email Notifications** — Transaction alerts and OTPs handled asynchronously via Nodemailer and transactional SMTP.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose, JSONWebToken, Bcrypt, Cookie-Parser, Nodemailer |
| **Database** | MongoDB Atlas (ACID Transactions enabled via replica set) |
| **Deployment** | Render (Static Site for Frontend, Web Service for Backend) |

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/         # Auth, Account, Ledger, Deposit, Transaction
│   │   ├── middleware/          # AuthMiddleware, SystemUserMiddleware
│   │   ├── models/              # User, Account, Ledger, Transaction, DepositRequest, Otp, Blacklist
│   │   ├── routes/              # Modular Express routing endpoints
│   │   ├── services/            # Email notification logic
│   │   └── app.js               # Express app configuration & CORS setup
│   ├── server.js                # Database connection & HTTP listener
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── _redirects           # Client-side routing resolution for Render SPA
│   ├── src/
│   │   ├── assets/
│   │   ├── components/          # Reusable UI cards, tables, modal forms
│   │   ├── pages/               # Dashboard, Login, Register, Admin Approvals, Transfer
│   │   ├── service/             # Axios client with cross-origin credentials
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Environment Variables Setup

### Backend Configuration (`backend/.env`)

```ini
PORT=8000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/banking-ledger?retryWrites=true&w=majority
FRONTEND_URL=https://banking-ledger-frontend.onrender.com

```

### Frontend Configuration (`frontend/.env`)

```ini
VITE_API_BASE_URL=https://banking-ledger-backend.onrender.com/api
```

---

## 🔌 API Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register new customer account | Public |
| POST | `/login` | Authenticate user & issue HttpOnly cookie | Public |
| POST | `/logout` | Invalidate active JWT into blacklist table | Authenticated |
| GET | `/me` | Fetch active user session profile | Authenticated |
| POST | `/forget-password` | Issue cryptographic 6-digit verification code | Public |
| POST | `/verify-otp` | Verify OTP and upgrade reset session token | Public |
| POST | `/reset-password` | Set new password with verified session token | Verified Session |

### 💳 Accounts & Ledger (`/api/accounts`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create primary bank account | Authenticated |
| GET | `/` | List all accounts belonging to the authenticated user | Authenticated |
| GET | `/balance/:accountId` | Compute real-time balance from ledger entries | Owner Only |
| GET | `/:accountId/history` | Retrieve full double-entry audit history | Owner Only |

### 💸 Transactions & Money Movement (`/api/transections`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Peer-to-peer transfer (ACID transaction) | Authenticated |

### 📥 Deposit Management (`/api/deposits`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create deposit (Auto-approved if ≤ ₹50,000) | Authenticated |
| GET | `/my` | List user's deposit requests & status | Authenticated |
| GET | `/pending` | List pending high-value deposit approvals | System Admin |
| GET | `/approved` | Audit log of approved deposits | System Admin |
| GET | `/rejected` | Audit log of rejected deposits | System Admin |
| PATCH | `/approve/:requestId` | Approve pending deposit & execute ledger credit | System Admin |
| PATCH | `/reject/:requestId` | Reject pending deposit | System Admin |

---

## 💻 Local Development Setup

**1. Clone the repository**
```bash
git clone https://github.com/<your-username>/banking-ledger.git
cd banking-ledger
```

**2. Configure and run Backend**
```bash
cd backend
npm install
npm run dev
```

**3. Configure and run Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

The client application will start at `http://localhost:5173`, connecting to the local API service at `http://localhost:8000/api`.

---

## 🚢 Render Deployment Guide

**Deploy Backend as a Web Service**
- Set Root Directory to `backend`.
- Build Command: `npm install`
- Start Command: `npm start`
- Populate production environment variables in the Render console (`NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `FRONTEND_URL`).

**Deploy Frontend as a Static Site**
- Set Root Directory to `frontend`.
- Build Command: `npm run build`
- Publish Directory: `dist` (ensure no leading dot).
- Set Environment Variable: `VITE_API_BASE_URL=https://<your-backend-service>.onrender.com/api`.
- Keep `public/_redirects` present to prevent 404 errors during client-side route reloading.

**Establish Cross-Origin Trust**
- Update `FRONTEND_URL` on the backend Web Service with the live frontend URL to satisfy CORS validation and cookie propagation.

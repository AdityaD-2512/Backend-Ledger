<p align="center">
  <b>Backend System simulating real-world fintech transaction infrastructure.</b>
</p>

# 💳 Banking Ledger System
### Production-Grade Backend for Secure Money Transfers

---

## 🚀 Overview

The Banking Ledger System is a backend-focused fintech simulation designed with production-level engineering principles.

It enables secure account creation and atomic money transfers between accounts while ensuring:

- 🔒 Authentication & Authorization
- 🔁 Idempotent Transactions (Duplicate Prevention)
- 💰 Atomic Balance Updates
- 📜 Immutable Ledger Records
- 🚫 Token Blacklisting (Secure Logout)
- 📧 Email Notifications
- 🛡 Concurrency & Double-Spend Protection

---

## 🏗 Architecture & Tech Stack

### 🔹 Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM

### 🔹 Security

- JWT Authentication
- HTTP-only Cookies
- Token Blacklisting
- Password Hashing (bcrypt)

### 🔹 Utilities

- Nodemailer (Email Service)
- MongoDB Transactions (Sessions)

---

## 📂 Project Structure

```bash
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── account.controller.js
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── account.model.js
│   │   ├── blacklist.model.js
│   │   ├── ledger.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── account.routes.js
│   │   ├── auth.routes.js
│   │   └── transaction.routes.js
│   ├── services/
│   │   └── email.service.js
│   └── app.js
│
├── server.js
├── package.json
└── .env
```

## ⚡ API Endpoints

### 🔐 Auth

```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

---

### 💸 Transactions

```http
POST   /api/transactions
```
#### 📦 Request Body
```
{
  "fromAccount": "accountId1",
  "toAccount": "accountId2",
  "amount": 1000,
  "idempotencyKey": "unique-key-xyz"
}
```

## 🐳 Running Locally

🔧 Prerequisites
- Node.js (v18+)
- MongoDB Atlas
- npm

1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd backend
npm install
```

2️⃣ Configure Environment

Create .env file:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

3️⃣ Start Server
```bash
npm run dev
```

Server runs at:

👉 http://localhost:3000
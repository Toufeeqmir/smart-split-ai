# SmartSplit

SmartSplit is a full-stack shared expense tracker with private and group chat. It helps roommates, friends, and small groups record expenses, split bills fairly, track balances, and coordinate in real time from the same app.

## Features

- Secure user registration and login with JWT authentication
- Email verification via OTP sent through Nodemailer
- Shared expense creation, editing, and deletion
- Equal split tracking across selected members
- Balance calculation and simplified settlement view
- Private one-to-one conversations
- Group conversations
- Real-time messaging with Socket.IO
- Seen status for messages
- Online presence indicators
- Profile photo upload and avatar display
- Dashboard filters for expenses by member, status, and sort order

## Tech Stack

### Frontend

- React 18
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- Redux Toolkit
- Vite

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer
- Socket.IO

## Project Structure

```text
smart-split-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
└── README.md
```

## Core User Flow

1. A user registers, and a 6-digit OTP is emailed to them via Nodemailer.
2. The user enters the OTP on the verification screen to activate their account.
3. Once verified, the user can log in; unverified accounts are blocked from logging in until they complete verification.
4. The frontend stores the JWT token in localStorage.
5. Protected API calls include the token in the Authorization header.
6. Users create expenses and split them with selected members.
7. The dashboard shows expense history and settlement information.
8. Users can open private chats or create group conversations.
9. Messages are delivered in real time with presence and seen updates.

## Main Pages

- `Dashboard`
  Add and manage expenses, review summary cards, and filter the ledger.
- `Conversations`
  Search users, start a private chat, and browse recent conversations.
- `Chat`
  Send messages, view the active chat partner or group, and track seen status.
- `Group`
  Create and open group conversations.
- `Login` and `Register`
  Handle authentication and profile setup.
- `VerifyOtp`
  Confirm the OTP sent to the user's email and resend it if needed.

## Main API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `GET /api/auth/users`

### Expenses

- `POST /api/expenses`
- `GET /api/expenses`
- `GET /api/expenses/balances`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Groups

- `POST /api/groups`
- `GET /api/groups`

### Conversations

- `POST /api/conversations/private`
- `POST /api/conversations/group`
- `GET /api/conversations`
- `GET /api/conversations/:id`

### Chat

- `POST /api/chat`
- `GET /api/chat`
- `GET /api/chat/:conversationId`
- `POST /api/chat/:conversationId/seen`

## Environment Variables

### Root

```bash
NODE_ENV=development
```

### Server

Create `server/.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-split
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
```

`SMTP_PASS` must be a Gmail App Password (requires 2-Step Verification enabled on the account), not the regular account password.

### Client

Create `client/.env.local` if needed:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Local Setup

### 1. Install dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 2. Start the backend

```bash
cd server
npm run dev
```

### 3. Start the frontend

```bash
cd client
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

Backend runs on:

- `http://localhost:5000`

## Production Build

Frontend build:

```bash
cd client
npm run build
```

## Database Models

### User

- `username`
- `email`
- `password`
- `avatar`
- `isVerified`
- `otp`
- `otpExpiry`

### Expense

- `description`
- `amount`
- `paidBy`
- `createdBy`
- `splitAmong`
- `settled`
- `groupId`

### Group

- `name`
- `members`
- `createdBy`

### Conversation

- `members`
- `isGroup`
- `name`

### Message

- `conversationId`
- `sender`
- `message`
- `seenBy`

## Real-Time Chat

Socket.IO is used for:

- user presence tracking
- joining conversation rooms
- receiving messages instantly
- seen status updates
- online status refresh inside chat views

## Notes

- Expense calculations are deterministic and handled on the backend.
- Chat visibility is restricted to conversation members.
- Expense editing and deletion are limited to the creator or payer.
- Profile photos are stored as image data strings and shown throughout the UI.
- OTPs expire 5 minutes after being issued; expired or incorrect codes are rejected with a clear error message.
- If the verification email fails to send during registration, the partially created account is rolled back so the same email can be used to register again.

## Interview Summary

SmartSplit is a full-stack expense-sharing and communication platform that combines:

- JWT-based authentication with email-verified onboarding
- MongoDB-backed expense management
- balance and settlement logic
- private and group real-time chat
- profile personalization with avatars

In one line:

**SmartSplit is a real-time shared expense and chat app for groups, built with React, Express, MongoDB, and Socket.IO, with email-based OTP verification on signup.**
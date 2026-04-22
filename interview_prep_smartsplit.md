# SmartSplit AI Interview Preparation

## 1. Project Overview

SmartSplit AI is a full-stack shared-expense management application with real-time chat features.

The main goal of the project is to help roommates, friends, or group members:

- track shared expenses
- split bills fairly
- calculate balances
- simplify settlements
- create private and group conversations
- exchange messages in real time
- use AI to parse natural-language expense descriptions

In simple words, the app combines expense tracking with communication so users can both manage money and discuss it in the same product.

## 2. Tech Stack

### Frontend

- React 18
- React Router
- Tailwind CSS
- Axios
- Socket.IO client
- Redux Toolkit is configured but most current flows use local component state
- Vite for development and build

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Socket.IO for real-time chat

### AI Service

- Separate Express microservice
- OpenAI API
- GPT-4o-mini used for parsing text into structured expense data

## 3. High-Level Architecture

The project has three main parts:

1. Client
   The React frontend handles UI, page navigation, API calls, and socket events.

2. Server
   The Express backend handles authentication, expenses, conversations, groups, messages, and database access.

3. AI Service
   A separate microservice takes natural-language text and returns structured JSON for expense parsing.

## 4. Main User Features

- User registration and login
- JWT-based protected access
- Profile photo upload
- Add expense
- Edit expense
- Delete expense
- Mark expense as settled
- View balances and settlement summary
- Search users
- Start private conversation
- Create group conversation
- Send and receive messages in real time
- Message seen status
- Online presence indicators
- AI-assisted expense parsing through a separate service

## 5. Frontend Structure

### App Shell

The main frontend entry is `client/src/App.jsx`.

It is responsible for:

- defining routes
- rendering the navbar
- rendering the sidebar
- switching between auth pages and app pages
- registering the logged-in user on Socket.IO

### Main Pages

#### Dashboard

File: `client/src/pages/Dashboard.jsx`

Responsibilities:

- load expenses and users
- create new expense entries
- update or delete expenses
- apply filters by member, status, and sorting
- display expense cards
- show balance summary

#### Conversations

File: `client/src/pages/Conversations.jsx`

Responsibilities:

- fetch all existing conversations
- fetch all users
- search users by username
- start a private chat
- render recent conversations
- show conversation avatar and online state

#### Chat

File: `client/src/pages/Chat.jsx`

Responsibilities:

- fetch a selected conversation
- fetch all messages for that conversation
- connect to Socket.IO room
- send messages
- receive real-time messages
- mark messages as seen
- update message status as sent, delivered, or seen
- show the current chat partner or group context

#### Group

File: `client/src/pages/Group.jsx`

Responsibilities:

- fetch users
- select members
- create group conversations
- list existing groups

#### Login and Register

Files:

- `client/src/pages/Login.jsx`
- `client/src/pages/Register.jsx`

Responsibilities:

- collect credentials
- call backend auth APIs
- store token in localStorage
- store current user in localStorage
- registration also supports optional profile photo upload

## 6. Important Frontend Components

### Navbar

File: `client/src/components/Navbar.jsx`

Responsibilities:

- show app branding
- show the logged-in user
- support profile photo updates
- detect if the current route is a chat route
- fetch and display who the user is chatting with

### Sidebar

File: `client/src/components/Sidebar.jsx`

Responsibilities:

- navigation between dashboard, conversations, group pages, login, and register

### BalanceSummary

File: `client/src/components/BalanceSummary.jsx`

Responsibilities:

- compute paid amount, owed amount, and net amount per member
- present summary cards for quick financial understanding

### ExpenseCard

File: `client/src/components/ExpenseCard.jsx`

Responsibilities:

- render one expense
- show who paid
- show per-person share
- show expense status
- expose edit and delete actions to allowed users

### ChatMessage

File: `client/src/components/ChatMessage.jsx`

Responsibilities:

- render individual message bubbles
- show avatar for incoming messages
- display timestamps
- show message status icons for sent, delivered, and seen

### MessageInput

File: `client/src/features/chat/MessageInput.jsx`

Responsibilities:

- manage message input state
- submit a message through the parent chat page

### Avatar

File: `client/src/components/Avatar.jsx`

Responsibilities:

- render profile image if available
- otherwise generate initials-based fallback avatar

## 7. Backend Structure

### Express App

File: `server/src/app.js`

Responsibilities:

- configure middleware
- enable CORS
- parse JSON
- attach routes for auth, expenses, chat, groups, conversations, and AI endpoints

### Server Entry

File: `server/src/server.js`

Responsibilities:

- create HTTP server
- attach Socket.IO
- connect to MongoDB
- expose the Socket.IO instance to the Express app
- start listening on the configured port

## 8. Backend Models

### User Model

File: `server/src/models/User.js`

Fields:

- username
- email
- password
- avatar

Key behavior:

- hashes password before save using bcrypt
- includes password comparison method

### Expense Model

File: `server/src/models/Expense.js`

Fields:

- groupId
- description
- amount
- paidBy
- createdBy
- splitAmong
- date
- settled

### Group Model

File: `server/src/models/Group.js`

Fields:

- name
- members
- createdBy

### Conversation Model

File: `server/src/models/conversation.js`

Fields:

- members
- isGroup
- name

### Message Model

File: `server/src/models/Message.js`

Fields:

- conversationId
- sender
- message
- seenBy

## 9. Authentication Flow

Main files:

- `server/src/controllers/authController.js`
- `server/src/middlewares/authMiddleware.js`
- `server/src/routes/authRoutes.js`

Flow:

1. A user registers with username, email, password, and optional avatar.
2. Password is hashed in the User model before saving.
3. On login, the backend checks the password with bcrypt.
4. If valid, the backend returns a JWT.
5. The frontend stores the token in localStorage.
6. Axios adds the token to the Authorization header.
7. Protected backend routes verify the token through middleware.
8. The middleware loads the user and stores it in `req.user`.

Auth controller functions:

- `register`
- `login`
- `getMe`
- `updateMe`
- `listUsers`

## 10. Expense Management Flow

Main files:

- `server/src/controllers/expenseController.js`
- `server/src/routes/expenseRoutes.js`

Expense controller functions:

### `addExpense`

- validates the payload
- normalizes split members
- ensures paidBy is included
- creates and saves an expense

### `getExpenses`

- returns expenses relevant to the logged-in user
- user can see expenses they created, paid, or are included in

### `updateExpense`

- checks if the expense exists
- checks edit permission
- validates the new values
- updates the expense

### `deleteExpense`

- checks if the expense exists
- checks delete permission
- deletes the expense

### `getBalances`

- loads relevant expenses
- calculates raw balances
- simplifies them into cleaner settlement suggestions

## 11. Balance Calculation Logic

Files:

- `server/src/utils/calculateBalances.js`
- `server/src/utils/simplifyBalances.js`

How it works:

1. For each expense, the amount is divided equally among all members in `splitAmong`.
2. If one user paid the whole expense, other users owe their share to that payer.
3. Raw balances are accumulated.
4. Simplification converts multiple debts into fewer final transactions.

Example:

- A pays 900 for 3 people
- each share is 300
- if A, B, C split equally, then B owes A 300 and C owes A 300

## 12. Conversation and Chat Flow

Main files:

- `server/src/controllers/conversationController.js`
- `server/src/controllers/chatController.js`
- `server/src/routes/conversationRoutes.js`
- `server/src/routes/chatRoutes.js`
- `server/src/sockets/chatSocket.js`

### Conversation controller responsibilities

- create or fetch private chat
- create group conversation
- list all conversations for a user
- fetch one conversation
- enrich conversation response with display name, avatar, other member info, online members, and last message

### Chat controller responsibilities

- send a message
- fetch all messages for a conversation
- mark messages as seen

### Socket responsibilities

- register connected users
- track online users
- let a socket join a conversation room
- emit incoming messages
- emit seen updates
- emit presence updates

## 13. Message Status Logic

Message state is tracked with:

- `sender`
- `seenBy`
- online presence from Socket.IO

Frontend status interpretation:

- `sent`
  message was created by sender

- `delivered`
  recipient is online in the conversation but has not yet seen it

- `seen`
  recipient username is present in `seenBy`

## 14. AI Microservice

Main files:

- `ai-service/src/index.js`
- `ai-service/src/routes.js`
- `ai-service/src/controller.js`
- `ai-service/src/services/parserService.js`
- `ai-service/src/services/llmClient.js`

Current role:

- accept text input
- call OpenAI
- ask the model to return structured JSON
- parse the JSON response

Example use case:

- user types: “A paid 1200 for groceries split among A, B, and C”
- AI service returns a JSON object that can later be mapped into an expense payload

## 15. API Routes Summary

### Auth

- `POST /api/auth/register`
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

### AI Service

- `POST /parse`

## 16. How To Explain Your Contribution

You can say:

- I worked on the chat interface and integrated it with backend conversation and message data.
- I improved the navbar so it shows the active chat partner.
- I added profile-photo upload and avatar handling.
- I connected message seen status to both backend APIs and socket events.
- I reviewed the project structure end to end and understood how auth, expenses, balances, and chat are connected.

## 17. Strong Points of the Project

- clear full-stack separation
- protected APIs with JWT
- MongoDB models for real entities
- real-time messaging with Socket.IO
- balance calculation and settlement logic
- AI microservice separation instead of mixing everything into one server
- reusable UI components and page-based routing

## 18. Honest Limitations You Can Mention

These are safe and professional to mention in interview:

- Redux exists in the project but much of the app still uses local state
- some AI route integration on the main backend is still incomplete
- a few service files are scaffolding rather than fully used
- some code areas show ongoing refactoring and cleanup opportunities
- testing coverage is not fully implemented yet

This is a good answer:

“The project is functional in core flows like auth, expenses, balances, and chat, but some secondary areas like AI route integration and a few service abstractions are still maturing.”

## 19. 60-Second Interview Answer

SmartSplit AI is a full-stack expense-sharing and communication app for roommates or small groups. Users authenticate with JWT, add shared expenses, and the backend calculates balances plus simplified settlements so users can see who owes whom. The app also supports private and group conversations using Socket.IO, which enables real-time message delivery, presence, and seen status. On the frontend I used React, React Router, Axios, Tailwind, and reusable components. On the backend I used Express, MongoDB with Mongoose, JWT middleware, and Socket.IO. There is also a separate AI microservice using OpenAI to parse natural-language expense descriptions into structured JSON.

## 20. Possible Interview Questions and Answers

### Q1. Why did you use a separate AI microservice?

Answer:
I separated the AI logic so the main app server stays focused on business logic like auth, expenses, and chat. This keeps responsibilities cleaner and makes it easier to scale or swap AI providers later.

### Q2. How do you protect private routes?

Answer:
The frontend stores the JWT token in localStorage. Axios attaches it in the Authorization header. The backend middleware verifies the token and loads the current user before protected controllers run.

### Q3. How is real-time chat implemented?

Answer:
Socket.IO is used on both client and server. When a user connects, the server registers that user, tracks presence, and allows the client to join a conversation room. Messages, seen events, and presence updates are emitted through those rooms.

### Q4. How are balances calculated?

Answer:
Each expense is divided equally across the split members. Everyone except the payer owes their share to the payer. Those raw balances are then simplified into a smaller set of final settlements.

### Q5. How do you know whether a message is seen?

Answer:
Each message stores a `seenBy` array. When a user opens a conversation, unseen messages from other users are updated so their username is added to `seenBy`. The frontend then displays that as a seen state.

### Q6. What would you improve next?

Answer:
I would improve automated testing, fully integrate the AI service into the main product flow, and move more shared state into a cleaner centralized architecture where useful.

## 21. Final Interview Closing Line

If you are asked to summarize the project in one line, say:

“SmartSplit AI is a real-time shared-expense and chat platform that combines financial coordination with communication in one full-stack application.”

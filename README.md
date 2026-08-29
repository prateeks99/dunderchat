# DunderChat

A real-time chat app built with Next.js, Express, Socket.IO, and MongoDB. It supports public rooms and one-to-one private messaging, with session-based auth via username/password or GitHub OAuth.

## Features

- **Room chat** — join channels (`general`, `sales`, `build`) and broadcast to everyone in them
- **Private messaging** — direct one-to-one conversations, persisted per user pair
- **Message history** — past messages are loaded from MongoDB on room/DM selection
- **Two auth methods** — local username + password (bcrypt-hashed) or GitHub OAuth
- **Sessions in MongoDB** — Passport sessions stored via `connect-mongo`, so logins survive restarts
- **Room management API** — create, list, and delete rooms
- **Dark/light theme** — shadcn/ui + Tailwind with a resizable split-pane chat layout

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 13 (App Router), TypeScript, Tailwind CSS, shadcn/ui, `socket.io-client` |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB via Mongoose |
| Auth | Passport (`passport-local`, `passport-github2`), `express-session`, bcrypt |
| Validation | `express-validator` (server), Zod + React Hook Form (client) |

## Project structure

```
dunderchat/
├── client/                     # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # login / register
│   │   └── chat/               # chat UI (rooms, DMs, message list)
│   ├── components/ui/          # shadcn/ui primitives
│   └── config/site.ts
└── server/                     # Express + Socket.IO backend
    └── src/
        ├── app.mjs             # Express setup + all socket event handlers
        ├── index.mjs           # Mongo connection, server bootstrap
        ├── routes/             # users, auth, messages, rooms
        ├── strategies/         # Passport local + GitHub
        ├── mongoose/schemas/   # User, Message, PrivateMessage, Room
        ├── handlers/           # user creation + password hashing
        └── utils/              # bcrypt helpers, validation schema
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)
- A GitHub OAuth app, if you want GitHub login — set the callback URL to `http://localhost:5000/api/auth/github/redirect`

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/dunderchat
SERVER_PORT=5000
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

```bash
npm run start:dev   # nodemon, or `npm start` for plain node
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:3000`. CORS and the Socket.IO origin on the server are both pinned to that address, so change them together if you use a different port.

## API

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth` | Log in with username + password |
| `GET` | `/api/auth/status` | Current session user, or 401 |
| `GET` | `/api/auth/logout` | Destroy the session |
| `GET` | `/api/auth/github` | Start GitHub OAuth |
| `GET` | `/api/auth/github/redirect` | OAuth callback |

### Users
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Register a new user |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get one user |
| `PUT` | `/api/users/:id` | Update username / display name |
| `DELETE` | `/api/users/:id` | Delete a user |

### Rooms & messages
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rooms` | List rooms |
| `POST` | `/api/rooms` | Create a room |
| `DELETE` | `/api/room/:id` | Delete a room |
| `GET` | `/api/messages/:room` | Message history for a room |
| `GET` | `/api/privatemessages/:userId/:friendId` | DM history between two users |

## Socket events

**Client → server**

| Event | Payload | Description |
|---|---|---|
| `send-id` | `userId` | Attach the user's ID to the socket |
| `send-name` | `displayName` | Register the socket in the name → socket map for DM routing |
| `join-room` | `roomName` | Join a room |
| `leave-room` | `{ room }` | Leave a room |
| `room-message` | `{ name, room, content }` | Send to a room |
| `private-message` | `{ senderName, recipientId, recipientName, content }` | Send a DM |

**Server → client**

| Event | Description |
|---|---|
| `room-message` | Broadcast of a saved room message |
| `private-message` | Delivery of a saved DM to sender and recipient |

Every message is written to MongoDB before or as it's emitted, so history and live delivery stay in sync.

## Notes and known gaps

- Local URLs (`localhost:3000` / `localhost:5000`) are hardcoded in the client fetches, CORS config, and the GitHub callback. These need to move to env vars before deploying.
- The session secret in `server/src/app.mjs` is hardcoded; move it to `.env`.
- Several packages imported by the server (`express-session`, `passport`, `passport-local`, `connect-mongo`, `mongoose`, `cors`, `cookie-parser`) aren't listed in `server/package.json` dependencies — worth adding so a clean `npm install` works.
- DM routing uses an in-memory socket map keyed by display name, so it won't survive a restart or scale past one server process.
- The `isLoggedIn` guards return `response.status(401)` without ending the request, so unauthenticated calls hang rather than failing fast.
- No tests yet.

## License

ISC

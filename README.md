# DunderChat

A Slack-style workspace for the Scranton branch of Dunder Mifflin Paper Co. Visitors join as a temp (or create an account) and chat in real time with each other and with thirteen scripted bots: Michael, Dwight, Jim, Pam, Ryan, Andy, Angela, Oscar, Kevin, Stanley, Phyllis, Creed and Toby.

Built with Next.js, Express, Socket.IO and MongoDB.

> A fan project. Not affiliated with NBC, Universal or *The Office*. All bot dialogue is original writing.

## Features

- **Channels and DMs**: six seeded channels (`#general`, `#sales`, `#accounting`, `#party-planning`, `#warehouse`, `#random`) with a few days of history, plus one-to-one direct messages
- **Threads**: reply in a side panel; parents show reply count, participants and last reply time
- **Reactions**: 24-emoji palette, toggle per user, hover to see who reacted
- **Mentions**: `@` autocomplete in the composer, highlighted mentions, mention badges
- **Unread tracking**: bold channels, red badges for mentions and DMs, a "New" line when you open a conversation
- **Presence and typing**: online dots, "Dwight is typing…"
- **Bots that answer**: see [How the bots work](#how-the-bots-work)
- **Guest access**: "Join as a new hire" creates a temp account instantly; temps and everything they posted are removed after 24 hours
- **Accounts**: username/password registration and login, optional GitHub OAuth. Only full accounts can create channels
- **Light and dark themes**, responsive down to phone width (sidebar drawer, full-screen threads)

## Stack

| Layer | Tech |
|---|---|
| Client | Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix/shadcn primitives, Zustand, `socket.io-client` |
| Server | Node.js, Express, Socket.IO, Passport (local + GitHub), `express-session` + `connect-mongo`, `express-rate-limit` |
| Database | MongoDB via Mongoose |
| Hosting | Vercel (client), Render (server), MongoDB Atlas (database) |

## Architecture

```
Browser ──HTTPS──▶ Vercel (Next.js)  ──/api/* rewrite──▶ Render (Express)  ──▶ MongoDB Atlas
   │                                                         ▲
   └──────────────── WebSocket (Socket.IO) ──────────────────┘
```

- **REST goes through the Next.js rewrite** (`client/next.config.mjs`), so the session cookie is first-party on the client's domain. Vercel and Render are different sites, and browsers increasingly block third-party cookies.
- **The socket connects to Render directly**, because Vercel can't proxy websockets. It authenticates with a short-lived HMAC-signed token from `GET /api/auth/socket-token` (`server/src/utils/socket-token.mjs`), not the cookie. The server derives identity from the token, so clients can't claim to be someone else.

```
dunderchat/
├── render.yaml                     # Render blueprint for the API
├── client/
│   ├── app/
│   │   ├── (marketing)/            # landing page + hero preview
│   │   ├── signin/                 # guest join, sign in, register
│   │   └── workspace/              # layout (bootstrap + socket) and components
│   ├── lib/                        # api, socket, zustand store, types, formatting
│   └── components/ui/              # shadcn/Radix primitives
└── server/src/
    ├── index.mjs                   # connect, seed, start bots + sweeper, listen
    ├── app.mjs                     # Express + Socket.IO setup
    ├── socket.mjs                  # socket auth and events
    ├── routes/                     # auth, users, conversations
    ├── services/                   # messages, conversations, users (guests, sweeper)
    ├── bots/                       # personas, scripted exchanges, engine
    ├── seed/                       # channels + backdated history
    └── mongoose/schemas/           # User, Conversation, Message, ReadState
```

## How the bots work

Scripted, with no LLM. The engine is in `server/src/bots/engine.mjs` and the lines are in `personas.mjs` and `exchanges.mjs`.

- **@mentions**: the mentioned bot shows a typing indicator, waits 1.5–4s, and replies (in the thread, if that's where you asked)
- **DMs**: every bot always answers; if your message hits one of that bot's trigger words, it stays on topic
- **Keywords**: e.g. *beets* → Dwight, *chili* → Kevin, *pretzel* → Stanley, *Toby* → Michael. 40% chance, with a 2-minute cooldown per bot per channel
- **Welcomes**: Michael, then Dwight, greet every new person in `#general`
- **Ambient chatter**: every 3–6 minutes while at least one human is connected, a bot posts or a short multi-bot exchange plays out
- **Guards**: bots never trigger each other, all bot posts go through one queue capped at one message per 3 seconds, and lines don't repeat until a bot's pool is used up

## Running locally

Prerequisites: Node.js 18.18+ and MongoDB (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env      # set MONGODB_URI at minimum
npm install
npm run start:dev         # http://localhost:5000, seeds bots + channels on first boot

# 2. Client (in another terminal)
cd client
npm install
npm run dev               # http://localhost:3000
```

The client proxies `/api/*` to `API_ORIGIN` (default `http://localhost:5000`) and opens the socket to `NEXT_PUBLIC_SOCKET_URL` (same default), so no client `.env` is needed locally.

## Deploying

### 1. MongoDB Atlas
Create a free cluster and a database user, allow access from anywhere (`0.0.0.0/0`, since Render's free tier has no static IPs), and copy the connection string, adding a database name such as `/dunderchat`.

### 2. Render (API)
New → **Blueprint** → select this repo; Render reads `render.yaml`. Fill in:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `CLIENT_URL` | Your Vercel URL, e.g. `https://dunderchat.vercel.app` (comma-separate extra origins such as preview URLs) |
| `SESSION_SECRET` | Generated automatically |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional |

Note the service URL, e.g. `https://dunderchat-api.onrender.com`.

### 3. Vercel (client)
Import the repo, set **Root Directory** to `client`, and add:

| Variable | Value |
|---|---|
| `API_ORIGIN` | Render URL |
| `NEXT_PUBLIC_SOCKET_URL` | Render URL |

Both are read at build time, so redeploy after changing them. If you didn't know the Vercel URL when configuring Render, update `CLIENT_URL` there afterwards.

### 4. GitHub OAuth (optional)
Create an OAuth app with callback URL `https://<your-vercel-domain>/api/auth/github/redirect`. The button only appears when both GitHub variables are set on the server.

### Free-tier notes
Render's free web services sleep after ~15 minutes idle; the first visit then takes 30–60 seconds, and the UI says so while it waits. Ambient bot chatter and the guest sweeper only run while the server is awake.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/guest` | Create a temp account and sign in (rate-limited) |
| `POST` | `/api/auth` | Sign in with username + password |
| `POST` | `/api/users` | Register (and sign in) |
| `GET` | `/api/auth/status` | Current user, or 401 |
| `GET` | `/api/auth/providers` | Whether GitHub login is enabled |
| `GET` | `/api/auth/socket-token` | Short-lived token for the socket handshake |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/github` | Start GitHub OAuth |
| `GET` | `/api/bootstrap` | Me, users, conversations with unread counts, who's online |
| `GET` | `/api/conversations/:id/messages?before=` | Top-level messages, 50 per page |
| `GET` | `/api/messages/:id/thread` | A thread's parent and replies |
| `POST` | `/api/conversations` | Create a channel (full accounts only) |
| `POST` | `/api/dms` | Get or create the DM with `{ userId }` |
| `POST` | `/api/conversations/:id/read` | Mark read |

## Socket events

| Direction | Event | Payload |
|---|---|---|
| → server | `message:send` | `{ conversationId, text, parentId? }`, acked with the saved message |
| → server | `reaction:toggle` | `{ conversationId, messageId, emoji }` |
| → server | `typing` | `{ conversationId, parentId?, isTyping }` |
| → server | `read` | `{ conversationId }` |
| ← client | `ready` | Sent once the socket has joined its rooms |
| ← client | `message:new` / `message:update` | Full message / reactions or thread metadata |
| ← client | `typing`, `presence` | Indicators |
| ← client | `conversation:new`, `user:new`, `users:removed` | Directory changes |

## Known gaps

- No automated tests yet
- Presence is kept in memory, so the API runs as a single instance
- No message editing, deletion, search or file uploads

## License

ISC

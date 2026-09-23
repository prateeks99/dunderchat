import { io, Socket } from "socket.io-client"

import { api } from "@/lib/api"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

// The socket talks to the API server directly (Vercel can't proxy websockets), so it
// authenticates with a short-lived token fetched through the proxied REST API.
// Using a function means every reconnect fetches a fresh token.
export function createSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    auth: (cb) => {
      api<{ token: string }>("/api/auth/socket-token")
        .then(({ token }) => cb({ token }))
        .catch(() => cb({}))
    },
  })
}

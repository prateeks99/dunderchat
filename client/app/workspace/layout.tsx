"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { api, ApiError } from "@/lib/api"
import { createSocket } from "@/lib/socket"
import { useWorkspace } from "@/lib/store"
import type { Bootstrap, Conversation, Message, MessagePatch, User } from "@/lib/types"
import { Icons } from "@/components/icons"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { ConversationView } from "./components/conversation-view"
import { Rail, Sidebar } from "./components/sidebar"
import { ThreadPanel } from "./components/thread-panel"

function Splash({ slow, error, onRetry }: { slow: boolean; error: string | null; onRetry: () => void }) {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-sidebar px-6 text-center text-sidebar-foreground">
      <span className="rounded-2xl bg-white/10 p-3 text-white">
        <Icons.logo className="h-12 w-12" />
      </span>
      {error ? (
        <>
          <p className="max-w-sm">{error}</p>
          <button type="button" onClick={onRetry} className="rounded-md bg-white px-4 py-2 text-sm font-bold text-sidebar">
            Try again
          </button>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 font-bold text-white">
            <Loader2 className="h-4 w-4 animate-spin" /> Clocking in…
          </p>
          {slow && (
            <p className="max-w-sm text-sm text-sidebar-muted">
              The office server naps when nobody&apos;s around. Waking it up can take up to a minute.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams<{ conversationId?: string }>()
  const conversationId = params?.conversationId
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const connectedOnce = useRef(false)

  const store = useWorkspace
  const conversations = useWorkspace((s) => s.conversations)
  const hasBootstrapped = useWorkspace((s) => !!s.me)

  // Bootstrap, then open the socket
  useEffect(() => {
    let cancelled = false
    const slowTimer = setTimeout(() => setSlow(true), 4000)
    const state = store.getState()

    api<Bootstrap>("/api/bootstrap")
      .then((data) => {
        if (cancelled) return
        state.hydrate(data)
        const socket = createSocket()
        state.setSocket(socket)

        socket.on("ready", async () => {
          // After a reconnect, catch up on anything missed while offline
          if (connectedOnce.current) {
            const fresh = await api<Bootstrap>("/api/bootstrap").catch(() => null)
            if (fresh) store.getState().hydrate(fresh)
            const { activeId, threadId, loadMessages, openThread } = store.getState()
            if (activeId) loadMessages(activeId)
            if (threadId) openThread(threadId)
          }
          connectedOnce.current = true
        })
        socket.on("message:new", (m: Message) => store.getState().receiveMessage(m))
        socket.on("message:update", (p: MessagePatch) => store.getState().applyPatch(p))
        socket.on("typing", (e) => store.getState().setTyping(e))
        socket.on("presence", ({ userId, online }) => store.getState().setPresence(userId, online))
        socket.on("conversation:new", (c: Omit<Conversation, "unreadCount" | "mentionCount">) =>
          store.getState().addConversation({ unreadCount: 0, mentionCount: 0, ...c })
        )
        socket.on("user:new", (u: User) => store.getState().addUser(u))
        socket.on("users:removed", (payload) => {
          const me = store.getState().me
          if (me && payload.userIds.includes(me._id)) {
            window.location.href = "/signin?expired=1"
            return
          }
          store.getState().removeUsers(payload)
        })
        socket.on("connect_error", async (err) => {
          if (err.message !== "unauthorized") return
          const signedIn = await api("/api/auth/status").then(() => true).catch(() => false)
          if (!signedIn) window.location.href = "/signin?expired=1"
        })
        setReady(true)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) router.replace("/signin")
        else setError(err.message || "Something went wrong loading the office.")
      })
      .finally(() => clearTimeout(slowTimer))

    return () => {
      cancelled = true
      clearTimeout(slowTimer)
      const { socket, setSocket } = store.getState()
      socket?.disconnect()
      setSocket(null)
    }
  }, [attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  // Default to #general
  useEffect(() => {
    if (!ready || conversationId) return
    const general = Object.values(conversations).find((c) => c.type === "channel" && c.name === "general")
    const first = general ?? Object.values(conversations)[0]
    if (first) router.replace(`/workspace/${first._id}`)
  }, [ready, conversationId, conversations, router])

  useEffect(() => {
    if (ready && conversationId) store.getState().setActive(conversationId)
  }, [ready, conversationId, store])

  // Coming back to the tab counts as reading the open conversation
  useEffect(() => {
    const onVisible = () => !document.hidden && store.getState().markActiveRead()
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [store])

  if (!ready || !hasBootstrapped) {
    return (
      <Splash
        slow={slow}
        error={error}
        onRetry={() => {
          setError(null)
          setAttempt((n) => n + 1)
        }}
      />
    )
  }

  const conversation = conversationId ? conversations[conversationId] : undefined

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <div className="hidden md:flex md:w-[328px] md:shrink-0">
        <Rail />
        <Sidebar />
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent aria-label="Navigation" aria-describedby={undefined}>
          <Rail />
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Dialog>

      <main className="flex min-w-0 flex-1">
        {conversationId && <ConversationView conversation={conversation} onOpenMenu={() => setMenuOpen(true)} />}
        <ThreadPanel />
      </main>
      {children}
    </div>
  )
}

import type { Socket } from "socket.io-client"
import { create } from "zustand"

import { api } from "@/lib/api"
import type { Bootstrap, Conversation, Message, MessagePatch, User } from "@/lib/types"

interface MessageList {
  items: Message[]
  hasMore: boolean
  loading: boolean
  loaded: boolean
}

interface ThreadState {
  parent: Message | null
  replies: Message[]
  loading: boolean
}

interface TypingEvent {
  conversationId: string
  parentId: string | null
  userId: string
  isTyping: boolean
}

interface Ack {
  ok: boolean
  error?: string
  message?: Message
}

interface WorkspaceState {
  me: User | null
  users: Record<string, User>
  conversations: Record<string, Conversation>
  online: Record<string, boolean>
  messages: Record<string, MessageList>
  threads: Record<string, ThreadState>
  // `${conversationId}:${parentId ?? ""}` -> ids of people typing there
  typing: Record<string, string[]>
  activeId: string | null
  threadId: string | null
  // Where the "New messages" line goes in each conversation (id of first unread message)
  newMarker: Record<string, string | null>
  socket: Socket | null

  hydrate: (data: Bootstrap) => void
  setSocket: (socket: Socket | null) => void
  setActive: (conversationId: string | null) => void
  markActiveRead: () => void
  loadMessages: (conversationId: string) => Promise<void>
  loadOlder: (conversationId: string) => Promise<void>
  openThread: (parentId: string) => Promise<void>
  closeThread: () => void
  receiveMessage: (message: Message) => void
  applyPatch: (patch: MessagePatch) => void
  addConversation: (conversation: Conversation) => void
  addUser: (user: User) => void
  removeUsers: (payload: { userIds: string[]; conversationIds: string[] }) => void
  setPresence: (userId: string, online: boolean) => void
  setTyping: (event: TypingEvent) => void
  send: (conversationId: string, text: string, parentId?: string | null) => Promise<Ack>
  toggleReaction: (message: Message, emoji: string) => void
}

export const typingKey = (conversationId: string, parentId: string | null = null) =>
  `${conversationId}:${parentId ?? ""}`

const emptyList: MessageList = { items: [], hasMore: false, loading: false, loaded: false }
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>()

const upsert = (items: Message[], message: Message) =>
  items.some((m) => m._id === message._id)
    ? items.map((m) => (m._id === message._id ? { ...m, ...message } : m))
    : [...items, message]

const patchIn = (items: Message[], patch: MessagePatch) =>
  items.map((m) => (m._id === patch._id ? { ...m, ...patch } : m))

function markerFor(items: Message[], unread: number) {
  if (!unread || !items.length) return null
  return items[Math.max(items.length - unread, 0)]._id
}

export const useWorkspace = create<WorkspaceState>()((set, get) => ({
  me: null,
  users: {},
  conversations: {},
  online: {},
  messages: {},
  threads: {},
  typing: {},
  activeId: null,
  threadId: null,
  newMarker: {},
  socket: null,

  hydrate: (data) =>
    set((state) => ({
      me: data.me,
      users: Object.fromEntries(data.users.map((u) => [u._id, u])),
      // Keep the active conversation's counts at zero while it's open
      conversations: Object.fromEntries(
        data.conversations.map((c) => [
          c._id,
          c._id === state.activeId ? { ...c, unreadCount: 0, mentionCount: 0 } : c,
        ])
      ),
      online: Object.fromEntries(data.online.map((id) => [id, true])),
    })),

  setSocket: (socket) => set({ socket }),

  setActive: (conversationId) => {
    const { conversations, messages } = get()
    if (!conversationId) return set({ activeId: null })
    const conversation = conversations[conversationId]
    const unread = conversation?.unreadCount ?? 0
    const list = messages[conversationId]
    set((state) => ({
      activeId: conversationId,
      threadId: null,
      newMarker: {
        ...state.newMarker,
        [conversationId]: list?.loaded ? markerFor(list.items, unread) : null,
      },
    }))
    // Stash the unread count so the marker can be placed once history loads
    pendingUnread.set(conversationId, unread)
    get().markActiveRead()
    if (!list?.loaded) get().loadMessages(conversationId)
  },

  markActiveRead: () => {
    const { activeId, conversations, socket } = get()
    if (!activeId || !conversations[activeId]) return
    const conversation = conversations[activeId]
    if (conversation.unreadCount || conversation.mentionCount) {
      set((state) => ({
        conversations: {
          ...state.conversations,
          [activeId]: { ...conversation, unreadCount: 0, mentionCount: 0 },
        },
      }))
    }
    socket?.emit("read", { conversationId: activeId })
  },

  loadMessages: async (conversationId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: { ...(state.messages[conversationId] ?? emptyList), loading: true },
      },
    }))
    try {
      const { messages, hasMore } = await api<{ messages: Message[]; hasMore: boolean }>(
        `/api/conversations/${conversationId}/messages`
      )
      const unread = pendingUnread.get(conversationId) ?? 0
      pendingUnread.delete(conversationId)
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: { items: messages, hasMore, loading: false, loaded: true },
        },
        newMarker: { ...state.newMarker, [conversationId]: markerFor(messages, unread) },
      }))
    } catch {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: { ...(state.messages[conversationId] ?? emptyList), loading: false },
        },
      }))
    }
  },

  loadOlder: async (conversationId) => {
    const list = get().messages[conversationId]
    if (!list?.hasMore || list.loading || !list.items.length) return
    set((state) => ({
      messages: { ...state.messages, [conversationId]: { ...list, loading: true } },
    }))
    try {
      const before = encodeURIComponent(list.items[0].createdAt)
      const { messages, hasMore } = await api<{ messages: Message[]; hasMore: boolean }>(
        `/api/conversations/${conversationId}/messages?before=${before}`
      )
      set((state) => {
        const current = state.messages[conversationId]
        return {
          messages: {
            ...state.messages,
            [conversationId]: {
              ...current,
              items: [...messages, ...current.items],
              hasMore,
              loading: false,
            },
          },
        }
      })
    } catch {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: { ...state.messages[conversationId], loading: false },
        },
      }))
    }
  },

  openThread: async (parentId) => {
    set((state) => ({
      threadId: parentId,
      threads: {
        ...state.threads,
        [parentId]: {
          parent: state.threads[parentId]?.parent ?? null,
          replies: state.threads[parentId]?.replies ?? [],
          loading: true,
        },
      },
    }))
    try {
      const { parent, replies } = await api<{ parent: Message; replies: Message[] }>(
        `/api/messages/${parentId}/thread`
      )
      set((state) => ({
        threads: { ...state.threads, [parentId]: { parent, replies, loading: false } },
      }))
    } catch {
      set((state) => ({
        threadId: state.threadId === parentId ? null : state.threadId,
      }))
    }
  },

  closeThread: () => set({ threadId: null }),

  receiveMessage: (message) => {
    const { me, activeId } = get()
    set((state) => {
      const next: Partial<WorkspaceState> = {}

      if (message.parentId) {
        const thread = state.threads[message.parentId]
        if (thread) {
          next.threads = {
            ...state.threads,
            [message.parentId]: { ...thread, replies: upsert(thread.replies, message) },
          }
        }
      } else {
        const list = state.messages[message.conversationId]
        if (list?.loaded) {
          next.messages = {
            ...state.messages,
            [message.conversationId]: { ...list, items: upsert(list.items, message) },
          }
        }
      }

      // Unread badges for top-level messages from others in conversations you aren't viewing
      const conversation = state.conversations[message.conversationId]
      const fromOther = message.senderId !== me?._id
      const isActive = message.conversationId === activeId
      if (conversation && fromOther && !isActive && !message.parentId) {
        const mentionsMe = me ? message.mentions.includes(me._id) : false
        next.conversations = {
          ...state.conversations,
          [conversation._id]: {
            ...conversation,
            unreadCount: conversation.unreadCount + 1,
            mentionCount:
              conversation.mentionCount + (conversation.type === "dm" || mentionsMe ? 1 : 0),
          },
        }
      }
      return next
    })

    if (message.conversationId === activeId && message.senderId !== me?._id) {
      if (typeof document === "undefined" || !document.hidden) get().markActiveRead()
    }
  },

  applyPatch: (patch) =>
    set((state) => {
      const next: Partial<WorkspaceState> = {}
      const list = state.messages[patch.conversationId]
      if (list?.loaded) {
        next.messages = {
          ...state.messages,
          [patch.conversationId]: { ...list, items: patchIn(list.items, patch) },
        }
      }
      const threads = { ...state.threads }
      const asParent = threads[patch._id]
      if (asParent?.parent) threads[patch._id] = { ...asParent, parent: { ...asParent.parent, ...patch } }
      const asReply = patch.parentId ? threads[patch.parentId] : undefined
      if (asReply && patch.parentId) {
        threads[patch.parentId] = { ...asReply, replies: patchIn(asReply.replies, patch) }
      }
      next.threads = threads
      return next
    }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversation._id]: {
          ...conversation,
          unreadCount: state.conversations[conversation._id]?.unreadCount ?? conversation.unreadCount ?? 0,
          mentionCount: state.conversations[conversation._id]?.mentionCount ?? conversation.mentionCount ?? 0,
        },
      },
    })),

  addUser: (user) => set((state) => ({ users: { ...state.users, [user._id]: user } })),

  removeUsers: ({ userIds, conversationIds }) =>
    set((state) => {
      const gone = new Set(userIds)
      const users = { ...state.users }
      userIds.forEach((id) => delete users[id])
      const conversations = { ...state.conversations }
      conversationIds.forEach((id) => delete conversations[id])
      const messages = Object.fromEntries(
        Object.entries(state.messages).map(([id, list]) => [
          id,
          { ...list, items: list.items.filter((m) => !gone.has(m.senderId)) },
        ])
      )
      return { users, conversations, messages }
    }),

  setPresence: (userId, online) =>
    set((state) => {
      const next = { ...state.online }
      if (online) next[userId] = true
      else delete next[userId]
      return { online: next }
    }),

  setTyping: ({ conversationId, parentId, userId, isTyping }) => {
    const key = typingKey(conversationId, parentId)
    const timerKey = `${key}|${userId}`
    clearTimeout(typingTimers.get(timerKey))
    typingTimers.delete(timerKey)

    const update = (typing: boolean) =>
      set((state) => {
        const current = state.typing[key] ?? []
        const users = typing
          ? current.includes(userId)
            ? current
            : [...current, userId]
          : current.filter((id) => id !== userId)
        return { typing: { ...state.typing, [key]: users } }
      })

    update(isTyping)
    // Clear stale indicators if the stop event never arrives
    if (isTyping) typingTimers.set(timerKey, setTimeout(() => update(false), 6000))
  },

  send: (conversationId, text, parentId = null) =>
    new Promise((resolve) => {
      const { socket } = get()
      if (!socket?.connected) {
        return resolve({ ok: false, error: "You're offline. Reconnecting…" })
      }
      socket
        .timeout(10000)
        .emit("message:send", { conversationId, text, parentId }, (err: Error | null, ack: Ack) => {
          if (err) return resolve({ ok: false, error: "The message didn't go through. Try again." })
          if (ack.ok && ack.message) get().receiveMessage(ack.message)
          resolve(ack)
        })
    }),

  toggleReaction: (message, emoji) => {
    get().socket?.emit("reaction:toggle", {
      conversationId: message.conversationId,
      messageId: message._id,
      emoji,
    })
  },
}))

const pendingUnread = new Map<string, number>()

// Display name for a conversation: "#sales" style for channels, the other person for DMs
export function conversationLabel(
  conversation: Conversation,
  users: Record<string, User>,
  meId?: string
) {
  if (conversation.type === "channel") return conversation.name ?? "channel"
  const otherId = conversation.members.find((id) => id !== meId) ?? meId
  return (otherId && users[otherId]?.displayName) || "Former temp"
}

export function dmPartner(
  conversation: Conversation,
  users: Record<string, User>,
  meId?: string
): User | undefined {
  if (conversation.type !== "dm") return undefined
  const otherId = conversation.members.find((id) => id !== meId)
  return otherId ? users[otherId] : undefined
}

export interface User {
  _id: string
  username: string
  displayName: string
  title: string
  color: string
  isBot: boolean
  isGuest: boolean
}

export interface Conversation {
  _id: string
  type: "channel" | "dm"
  name: string | null
  topic: string
  isDefault: boolean
  members: string[]
  createdAt: string
  unreadCount: number
  mentionCount: number
}

export interface Reaction {
  emoji: string
  userIds: string[]
}

export interface Message {
  _id: string
  conversationId: string
  senderId: string
  text: string
  mentions: string[]
  parentId: string | null
  replyCount: number
  lastReplyAt?: string | null
  replyUserIds: string[]
  reactions: Reaction[]
  createdAt: string
}

// Partial updates pushed by the server (reactions or thread metadata)
export type MessagePatch = Pick<Message, "_id" | "conversationId" | "parentId"> &
  Partial<Message>

export interface Bootstrap {
  me: User
  users: User[]
  conversations: Conversation[]
  online: string[]
}

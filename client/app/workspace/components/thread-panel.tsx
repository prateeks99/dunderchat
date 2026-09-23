"use client"

import { useEffect, useRef } from "react"
import { Loader2, X } from "lucide-react"

import { conversationLabel, useWorkspace } from "@/lib/store"
import { Composer } from "./composer"
import { isGrouped } from "./message-list"
import { MessageItem } from "./message-item"
import { TypingIndicator } from "./typing-indicator"

export function ThreadPanel() {
  const threadId = useWorkspace((s) => s.threadId)
  const thread = useWorkspace((s) => (s.threadId ? s.threads[s.threadId] : undefined))
  const conversations = useWorkspace((s) => s.conversations)
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)
  const closeThread = useWorkspace((s) => s.closeThread)
  const scrollRef = useRef<HTMLDivElement>(null)

  const parent = thread?.parent
  const conversation = parent ? conversations[parent.conversationId] : undefined
  const replies = thread?.replies ?? []

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [threadId, replies.length])

  useEffect(() => {
    if (!threadId) return
    // defaultPrevented: the composer already used this Escape to close its mention list
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !e.defaultPrevented && closeThread()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [threadId, closeThread])

  if (!threadId) return null

  const where = conversation
    ? conversation.type === "channel"
      ? `#${conversation.name}`
      : conversationLabel(conversation, users, meId)
    : ""

  return (
    <aside className="fixed inset-0 z-40 flex flex-col bg-background md:static md:z-auto md:w-[380px] md:shrink-0 md:border-l lg:w-[420px]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="min-w-0">
          <h2 className="font-black leading-tight">Thread</h2>
          <p className="truncate text-xs text-muted-foreground">{where}</p>
        </div>
        <button
          type="button"
          aria-label="Close thread"
          onClick={closeThread}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto py-2">
        {!parent ? (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <MessageItem message={parent} inThread />
            <div className="my-2 flex items-center gap-3 px-5">
              <span className="text-xs text-muted-foreground">
                {parent.replyCount} {parent.replyCount === 1 ? "reply" : "replies"}
              </span>
              <span className="flex-1 border-t" />
            </div>
            {thread?.loading && !replies.length ? (
              <div className="flex justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              replies.map((reply, i) => (
                <MessageItem key={reply._id} message={reply} inThread compact={isGrouped(replies[i - 1], reply)} />
              ))
            )}
          </>
        )}
      </div>

      {parent && (
        <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">
          <TypingIndicator conversationId={parent.conversationId} parentId={parent._id} />
          <Composer conversationId={parent.conversationId} parentId={parent._id} placeholder="Reply…" autoFocus />
        </div>
      )}
    </aside>
  )
}

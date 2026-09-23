"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { siteConfig } from "@/config/site"
import { conversationLabel, useWorkspace } from "@/lib/store"
import type { Conversation } from "@/lib/types"
import { ChannelHeader } from "./channel-header"
import { Composer } from "./composer"
import { MessageList } from "./message-list"
import { TypingIndicator } from "./typing-indicator"

function GuestBanner() {
  const isGuest = useWorkspace((s) => s.me?.isGuest)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("dm-guest-banner") === "1")
    } catch {
      setDismissed(false)
    }
  }, [])

  if (!isGuest || dismissed) return null
  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem("dm-guest-banner", "1")
    } catch {}
  }
  return (
    <div className="flex items-center gap-3 border-b bg-mention px-4 py-2 text-sm text-mention-foreground md:px-5">
      <p className="flex-1">
        You&apos;re a <b>temp</b>. Your account and messages are cleared after 24 hours.{" "}
        <Link href="/signin?mode=register" className="font-bold underline underline-offset-2">
          Get hired full-time
        </Link>
      </p>
      <button type="button" aria-label="Dismiss" onClick={dismiss} className="rounded p-1 hover:bg-black/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface Props {
  conversation?: Conversation
  onOpenMenu: () => void
}

export function ConversationView({ conversation, onOpenMenu }: Props) {
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)
  const threadOpen = useWorkspace((s) => !!s.threadId)
  const label = conversation ? conversationLabel(conversation, users, meId) : null

  useEffect(() => {
    if (!conversation || !label) return
    document.title = `${conversation.type === "channel" ? `#${label}` : label} · ${siteConfig.name}`
  }, [conversation, label])

  if (!conversation) {
    return (
      <section className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-2 md:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onOpenMenu}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-lg font-black">This conversation has left the building.</p>
          <p className="text-muted-foreground">It may have belonged to a temp whose contract ended.</p>
          <Link href="/workspace" className="mt-2 font-bold text-primary hover:underline">
            Back to #general
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={threadOpen ? "hidden min-w-0 flex-1 flex-col md:flex" : "flex min-w-0 flex-1 flex-col"}>
      <ChannelHeader conversation={conversation} onOpenMenu={onOpenMenu} />
      <GuestBanner />
      <MessageList key={conversation._id} conversation={conversation} />
      <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">
        <TypingIndicator conversationId={conversation._id} />
        <Composer
          conversationId={conversation._id}
          placeholder={`Message ${conversation.type === "channel" ? `#${label}` : label}`}
          autoFocus
        />
      </div>
    </section>
  )
}

"use client"

import { Hash, Menu, Users } from "lucide-react"

import { conversationLabel, dmPartner, useWorkspace } from "@/lib/store"
import type { Conversation } from "@/lib/types"
import { Hint } from "@/components/ui/tooltip"
import { UserAvatar } from "./user-avatar"

interface Props {
  conversation: Conversation
  onOpenMenu: () => void
}

export function ChannelHeader({ conversation, onOpenMenu }: Props) {
  const users = useWorkspace((s) => s.users)
  const online = useWorkspace((s) => s.online)
  const meId = useWorkspace((s) => s.me?._id)
  const partner = dmPartner(conversation, users, meId)
  const onlineCount = Object.keys(online).filter((id) => users[id]).length

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 md:px-5">
      <button
        type="button"
        aria-label="Open sidebar"
        onClick={onOpenMenu}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {conversation.type === "channel" ? (
          <Hash className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <UserAvatar user={partner} size="sm" online={!!partner && !!online[partner._id]} />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black leading-tight">
            {conversationLabel(conversation, users, meId)}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.type === "channel" ? conversation.topic : partner?.title}
          </p>
        </div>
      </div>

      {conversation.type === "channel" && (
        <Hint label={`${onlineCount} people online`}>
          <span className="flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {Object.keys(users).length}
            <span className="hidden sm:inline">· {onlineCount} online</span>
          </span>
        </Hint>
      )}
    </header>
  )
}

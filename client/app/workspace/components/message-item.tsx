"use client"

import { memo, useState } from "react"
import { MessageSquareText, SmilePlus } from "lucide-react"

import { QUICK_REACTIONS } from "@/lib/constants"
import { formatTime, getDayLabel } from "@/lib/format"
import { useWorkspace } from "@/lib/store"
import type { Message } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Hint } from "@/components/ui/tooltip"
import { EmojiPicker } from "./emoji-picker"
import { MessageText } from "./message-text"
import { UserAvatar } from "./user-avatar"

interface Props {
  message: Message
  // Grouped under the previous message from the same person: no avatar or name
  compact?: boolean
  // Rendered inside the thread panel: no "reply in thread" action or reply summary
  inThread?: boolean
}

// "today" / "yesterday" read naturally mid-sentence; full dates keep their capitals
const relativeDay = (date: string) => {
  const label = getDayLabel(date)
  return label === "Today" || label === "Yesterday" ? label.toLowerCase() : `on ${label}`
}

function RoleBadge({ isBot, isGuest }: { isBot?: boolean; isGuest?: boolean }) {
  if (!isBot && !isGuest) return null
  return (
    <span className="rounded bg-muted px-1 py-px text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {isBot ? "Bot" : "Temp"}
    </span>
  )
}

export const MessageItem = memo(function MessageItem({ message, compact, inThread }: Props) {
  const sender = useWorkspace((s) => s.users[message.senderId])
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)
  const toggleReaction = useWorkspace((s) => s.toggleReaction)
  const openThread = useWorkspace((s) => s.openThread)
  const [pickerOpen, setPickerOpen] = useState(false)

  const mentionsMe = !!meId && message.mentions.includes(meId)
  const name = sender?.displayName ?? "Former temp"
  const react = (emoji: string) => toggleReaction(message, emoji)

  return (
    <div
      className={cn(
        "group relative flex gap-2 px-4 transition-colors hover:bg-muted/60 md:px-5",
        compact ? "py-0.5" : "pb-1 pt-2",
        mentionsMe && "border-l-2 border-amber-500 bg-highlight hover:bg-highlight",
        pickerOpen && "bg-muted/60"
      )}
    >
      <div className="w-9 shrink-0">
        {compact ? (
          <span className="invisible block pt-1 text-right text-[10px] leading-5 text-muted-foreground group-hover:visible">
            {formatTime(message.createdAt).replace(/\s?[AP]M$/i, "")}
          </span>
        ) : (
          <UserAvatar user={sender} className="mt-0.5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-black">{name}</span>
            <RoleBadge isBot={sender?.isBot} isGuest={sender?.isGuest} />
            <Hint label={`${getDayLabel(message.createdAt)} at ${formatTime(message.createdAt)}`}>
              <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
            </Hint>
          </div>
        )}
        <MessageText text={message.text} />

        {message.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.reactions.map((r) => {
              const mine = !!meId && r.userIds.includes(meId)
              const names = r.userIds.map((id) => users[id]?.displayName ?? "a former temp")
              return (
                <Hint key={r.emoji} label={`${names.join(", ")} reacted with ${r.emoji}`}>
                  <button
                    type="button"
                    onClick={() => react(r.emoji)}
                    className={cn(
                      "flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-bold transition-colors",
                      mine
                        ? "border-primary/60 bg-accent text-accent-foreground"
                        : "border-transparent bg-muted hover:border-border"
                    )}
                  >
                    <span className="text-sm">{r.emoji}</span>
                    {r.userIds.length}
                  </button>
                </Hint>
              )
            })}
            <EmojiPicker onPick={react} align="start">
              <button
                type="button"
                aria-label="Add reaction"
                className="flex h-6 items-center rounded-full bg-muted px-2 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <SmilePlus className="h-3.5 w-3.5" />
              </button>
            </EmojiPicker>
          </div>
        )}

        {!inThread && message.replyCount > 0 && (
          <button
            type="button"
            onClick={() => openThread(message._id)}
            className="-ml-1 mt-1 flex items-center gap-2 rounded-md border border-transparent p-1 pr-3 text-left text-xs transition-colors hover:border-border hover:bg-background"
          >
            <span className="flex -space-x-1">
              {message.replyUserIds.slice(0, 4).map((id) => (
                <UserAvatar key={id} user={users[id]} size="xs" className="ring-2 ring-background" />
              ))}
            </span>
            <span className="font-bold text-primary">
              {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
            </span>
            {message.lastReplyAt && (
              <span className="text-muted-foreground">
                Last reply {relativeDay(message.lastReplyAt)} at {formatTime(message.lastReplyAt)}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Hover toolbar */}
      <div
        className={cn(
          "absolute -top-4 right-4 z-10 flex items-center rounded-lg border bg-popover p-0.5 shadow-sm",
          pickerOpen ? "flex" : "hidden group-hover:flex"
        )}
      >
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => react(emoji)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
          >
            {emoji}
          </button>
        ))}
        <EmojiPicker onPick={react} onOpenChange={setPickerOpen}>
          <button
            type="button"
            aria-label="Add reaction"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <SmilePlus className="h-4 w-4" />
          </button>
        </EmojiPicker>
        {!inThread && (
          <Hint label="Reply in thread">
            <button
              type="button"
              aria-label="Reply in thread"
              onClick={() => openThread(message._id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MessageSquareText className="h-4 w-4" />
            </button>
          </Hint>
        )}
      </div>
    </div>
  )
})

"use client"

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, Hash, Loader2 } from "lucide-react"

import { GROUP_WINDOW_MS } from "@/lib/constants"
import { getDayLabel, isSameDay } from "@/lib/format"
import { dmPartner, useWorkspace } from "@/lib/store"
import type { Conversation, Message } from "@/lib/types"
import { MessageItem } from "./message-item"
import { UserAvatar } from "./user-avatar"

const NEAR_BOTTOM_PX = 120

export const isGrouped = (prev: Message | undefined, message: Message) =>
  !!prev &&
  prev.senderId === message.senderId &&
  isSameDay(prev.createdAt, message.createdAt) &&
  new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS &&
  prev.replyCount === 0

export function DayDivider({ date }: { date: string }) {
  return (
    <div className="relative my-2 flex items-center justify-center px-5" role="separator">
      <span className="absolute inset-x-0 top-1/2 border-t" />
      <span className="relative rounded-full border bg-background px-3 py-0.5 text-xs font-bold">
        {getDayLabel(date)}
      </span>
    </div>
  )
}

function Intro({ conversation }: { conversation: Conversation }) {
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)
  const partner = dmPartner(conversation, users, meId)

  if (conversation.type === "channel") {
    return (
      <div className="px-4 pb-4 pt-10 md:px-5">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Hash className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black">#{conversation.name}</h2>
        <p className="mt-1 text-muted-foreground">
          This is the very beginning of the <b className="text-foreground">#{conversation.name}</b> channel.{" "}
          {conversation.topic}
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4 pt-10 md:px-5">
      <UserAvatar user={partner} size="lg" className="mb-3" />
      <h2 className="text-2xl font-black">{partner?.displayName ?? "Former temp"}</h2>
      {partner?.title && <p className="text-sm text-muted-foreground">{partner.title}</p>}
      <p className="mt-2 text-muted-foreground">
        This is the very beginning of your direct messages with{" "}
        <b className="text-foreground">{partner?.displayName ?? "this person"}</b>.
        {partner?.isBot && " They're one of the Scranton bots, so say hi and they'll answer (in character)."}
      </p>
    </div>
  )
}

export function MessageList({ conversation }: { conversation: Conversation }) {
  const list = useWorkspace((s) => s.messages[conversation._id])
  const marker = useWorkspace((s) => s.newMarker[conversation._id])
  const meId = useWorkspace((s) => s.me?._id)
  const loadOlder = useWorkspace((s) => s.loadOlder)

  const scrollRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const snapshotRef = useRef<{ firstId?: string; height: number; top: number }>({ height: 0, top: 0 })
  const positionedRef = useRef<string | null>(null)
  const [showJump, setShowJump] = useState(false)

  const items = useMemo(() => list?.items ?? [], [list?.items])
  const lastId = items.at(-1)?._id

  // Keep the viewport steady when older messages are prepended, and follow new ones
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || !list?.loaded) return

    // First paint for this conversation: jump to the "New" line, or the bottom
    if (positionedRef.current !== conversation._id) {
      positionedRef.current = conversation._id
      const target = marker && el.querySelector<HTMLElement>(`[data-marker="${marker}"]`)
      if (target) el.scrollTop = target.offsetTop - 80
      else el.scrollTop = el.scrollHeight
    } else if (snapshotRef.current.firstId && snapshotRef.current.firstId !== items[0]?._id) {
      el.scrollTop = el.scrollHeight - snapshotRef.current.height + snapshotRef.current.top
    } else if (atBottomRef.current || items.at(-1)?.senderId === meId) {
      el.scrollTop = el.scrollHeight
    } else {
      setShowJump(true)
    }
    snapshotRef.current = { firstId: items[0]?._id, height: el.scrollHeight, top: el.scrollTop }
  }, [conversation._id, list?.loaded, items, marker, meId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reactions and thread counts can grow a message; stay pinned to the bottom if we were there
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (atBottomRef.current) el.scrollTop = el.scrollHeight
    })
    Array.from(el.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [conversation._id, lastId])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    if (atBottomRef.current) setShowJump(false)
    snapshotRef.current = { firstId: items[0]?._id, height: el.scrollHeight, top: el.scrollTop }
    if (el.scrollTop < 200 && list?.hasMore && !list.loading) loadOlder(conversation._id)
  }

  const jumpToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    setShowJump(false)
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={onScroll} className="scrollbar-thin relative h-full overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-full flex-col justify-end pb-2">
          {!list?.loaded ? (
            <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              {list.hasMore ? (
                <div className="flex justify-center py-4 text-muted-foreground">
                  {list.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              ) : (
                <Intro conversation={conversation} />
              )}
              {items.map((message, i) => {
                const prev = items[i - 1]
                const newDay = !prev || !isSameDay(prev.createdAt, message.createdAt)
                const isMarker = message._id === marker
                return (
                  <Fragment key={message._id}>
                    {newDay && <DayDivider date={message.createdAt} />}
                    {isMarker && (
                      <div data-marker={message._id} className="relative my-1 flex items-center px-5" role="separator">
                        <span className="flex-1 border-t border-destructive/70" />
                        <span className="ml-2 text-xs font-bold text-destructive">New</span>
                      </div>
                    )}
                    <MessageItem message={message} compact={!newDay && !isMarker && isGrouped(prev, message)} />
                  </Fragment>
                )
              })}
            </>
          )}
        </div>
      </div>

      {showJump && (
        <button
          type="button"
          onClick={jumpToBottom}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg"
        >
          <ArrowDown className="h-3.5 w-3.5" /> New messages
        </button>
      )}
    </div>
  )
}

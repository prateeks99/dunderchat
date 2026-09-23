"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AtSign, SendHorizontal, Smile } from "lucide-react"

import { useWorkspace } from "@/lib/store"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EmojiPicker } from "./emoji-picker"
import { UserAvatar } from "./user-avatar"

const MENTION_QUERY_RE = /(?:^|\s)@([a-z0-9._-]*)$/i
const TYPING_IDLE_MS = 3000

interface Props {
  conversationId: string
  parentId?: string | null
  placeholder: string
  autoFocus?: boolean
}

export function Composer({ conversationId, parentId = null, placeholder, autoFocus }: Props) {
  const send = useWorkspace((s) => s.send)
  const socket = useWorkspace((s) => s.socket)
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)

  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [caret, setCaret] = useState(0)
  const [highlight, setHighlight] = useState(0)
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingRef = useRef<{ active: boolean; timer?: ReturnType<typeof setTimeout> }>({ active: false })

  // Reset the draft when switching conversations
  useEffect(() => {
    setText("")
    setError(null)
    if (autoFocus && window.matchMedia("(min-width: 768px)").matches) inputRef.current?.focus()
  }, [conversationId, parentId, autoFocus])

  // Auto-grow up to a limit
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [text])

  const setTyping = (active: boolean) => {
    const state = typingRef.current
    clearTimeout(state.timer)
    if (active) state.timer = setTimeout(() => setTyping(false), TYPING_IDLE_MS)
    if (state.active === active) return
    state.active = active
    socket?.emit("typing", { conversationId, parentId, isTyping: active })
  }

  // Stop the indicator when leaving this conversation
  useEffect(() => () => setTyping(false), [conversationId, parentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const mentionQuery = useMemo(() => text.slice(0, caret).match(MENTION_QUERY_RE)?.[1] ?? null, [text, caret])

  const suggestions = useMemo(() => {
    if (mentionQuery === null || mentionQuery === dismissedQuery) return []
    const q = mentionQuery.toLowerCase()
    return Object.values(users)
      .filter((u) => u._id !== meId)
      .filter((u) => u.username.startsWith(q) || u.displayName.toLowerCase().includes(q))
      .sort((a, b) => Number(b.username.startsWith(q)) - Number(a.username.startsWith(q)) || a.displayName.localeCompare(b.displayName))
      .slice(0, 6)
  }, [mentionQuery, dismissedQuery, users, meId])

  useEffect(() => setHighlight(0), [mentionQuery])

  const insertAtCaret = (value: string, replaceBefore = 0) => {
    const el = inputRef.current
    const pos = el?.selectionStart ?? text.length
    const next = text.slice(0, pos - replaceBefore) + value + text.slice(pos)
    const nextCaret = pos - replaceBefore + value.length
    setText(next)
    setCaret(nextCaret)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(nextCaret, nextCaret)
    })
  }

  const pickMention = (user: User) => insertAtCaret(`@${user.username} `, (mentionQuery?.length ?? 0) + 1)

  const submit = async () => {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setError(null)
    setTyping(false)
    const result = await send(conversationId, body, parentId)
    setSending(false)
    if (result.ok) setText("")
    else setError(result.error ?? "Couldn't send that message.")
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        const delta = e.key === "ArrowDown" ? 1 : -1
        setHighlight((h) => (h + delta + suggestions.length) % suggestions.length)
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        pickMention(suggestions[highlight])
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setDismissedQuery(mentionQuery)
        return
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="relative px-4 pb-1 md:px-5">
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 z-20 mb-1 overflow-hidden rounded-lg border bg-popover shadow-lg md:left-5 md:right-auto md:w-80">
          <p className="border-b px-3 py-1.5 text-xs font-bold text-muted-foreground">People</p>
          {suggestions.map((u, i) => (
            <button
              key={u._id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pickMention(u)}
              onMouseEnter={() => setHighlight(i)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                i === highlight && "bg-primary text-primary-foreground"
              )}
            >
              <UserAvatar user={u} size="sm" />
              <span className="font-bold">{u.displayName}</span>
              <span className={cn("truncate text-xs", i === highlight ? "opacity-80" : "text-muted-foreground")}>
                @{u.username}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-input bg-card shadow-sm transition-colors focus-within:border-foreground/40">
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => {
            setText(e.target.value)
            setCaret(e.target.selectionStart)
            setDismissedQuery(null)
            setTyping(e.target.value.trim().length > 0)
          }}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyDown={onKeyDown}
          className="block max-h-[200px] w-full resize-none bg-transparent px-3 pt-2.5 text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between px-1.5 pb-1.5">
          <div className="flex items-center">
            <EmojiPicker onPick={(emoji) => insertAtCaret(emoji)} align="start">
              <button
                type="button"
                aria-label="Insert emoji"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Smile className="h-4 w-4" />
              </button>
            </EmojiPicker>
            <button
              type="button"
              aria-label="Mention someone"
              onClick={() => insertAtCaret(text && !/\s$/.test(text.slice(0, caret)) ? " @" : "@")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <AtSign className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Send message"
            disabled={!text.trim() || sending}
            onClick={submit}
            className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-primary-foreground transition-opacity disabled:bg-transparent disabled:text-muted-foreground disabled:opacity-60"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className={cn("mt-1 h-4 text-xs", error ? "text-destructive" : "hidden text-muted-foreground md:block")}>
        {error ?? (
          <>
            <b>Enter</b> to send · <b>Shift + Enter</b> for a new line · <b>@</b> to mention
          </>
        )}
      </p>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, Hash, House, LogOut, Plus, SquarePen, UserPlus } from "lucide-react"
import { useTheme } from "next-themes"

import { api } from "@/lib/api"
import { dmPartner, useWorkspace } from "@/lib/store"
import type { Conversation, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Hint } from "@/components/ui/tooltip"
import { AddChannelDialog, NewMessageDialog, useOpenDm } from "./dialogs"
import { UserAvatar } from "./user-avatar"

interface Props {
  // Called after navigating, so the mobile drawer can close
  onNavigate?: () => void
}

export async function signOut() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => null)
  window.location.href = "/"
}

function ProfileMenu() {
  const me = useWorkspace((s) => s.me)
  const { theme, setTheme } = useTheme()
  if (!me) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Your profile" className="rounded-lg outline-none ring-sidebar-active focus-visible:ring-2">
          <UserAvatar user={me} online ringClassName="border-rail" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-64">
        <div className="flex items-center gap-3 p-2">
          <UserAvatar user={me} />
          <div className="min-w-0">
            <p className="truncate font-black">{me.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{me.title || `@${me.username}`}</p>
          </div>
        </div>
        {me.isGuest && (
          <p className="mx-2 mb-2 rounded-md bg-mention px-2 py-1.5 text-xs text-mention-foreground">
            You&apos;re a temp. This account and your messages are cleared after 24 hours.
          </p>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">Match system</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        {me.isGuest && (
          <DropdownMenuItem asChild>
            <Link href="/signin?mode=register">
              <UserPlus className="h-4 w-4" /> Create a real account
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Rail() {
  return (
    <nav className="flex w-[68px] shrink-0 flex-col items-center gap-3 bg-rail py-3" aria-label="Workspace">
      <Link href="/" aria-label="Dunder Mifflin home" className="rounded-xl bg-white/10 p-1.5 text-white">
        <Icons.logo className="h-7 w-7" />
      </Link>
      <Hint label="Home" side="right">
        <span className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <House className="h-5 w-5" />
          </span>
          Home
        </span>
      </Hint>
      <div className="flex-1" />
      <ProfileMenu />
    </nav>
  )
}

function SectionHeader({
  label,
  open,
  onToggle,
  action,
}: {
  label: string
  open: boolean
  onToggle: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="group flex items-center px-2 pt-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex flex-1 items-center gap-1 rounded-md px-1.5 py-1 text-left text-sm font-bold text-sidebar-muted hover:bg-sidebar-hover"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", !open && "-rotate-90")} />
        {label}
      </button>
      {action}
    </div>
  )
}

function Badge({ count }: { count: number }) {
  if (!count) return null
  return (
    <span className="ml-auto min-w-[20px] rounded-full bg-red-600 px-1.5 text-center text-xs font-bold leading-5 text-white">
      {count > 99 ? "99+" : count}
    </span>
  )
}

const itemClass = (active: boolean, unread: boolean) =>
  cn(
    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[15px] transition-colors",
    active
      ? "bg-sidebar-active text-sidebar-active-foreground"
      : unread
        ? "font-black text-white hover:bg-sidebar-hover"
        : "text-sidebar-foreground hover:bg-sidebar-hover"
  )

export function Sidebar({ onNavigate }: Props) {
  const me = useWorkspace((s) => s.me)
  const users = useWorkspace((s) => s.users)
  const conversations = useWorkspace((s) => s.conversations)
  const online = useWorkspace((s) => s.online)
  const activeId = useWorkspace((s) => s.activeId)
  const openDm = useOpenDm()

  const [channelsOpen, setChannelsOpen] = useState(true)
  const [dmsOpen, setDmsOpen] = useState(true)
  const [addChannel, setAddChannel] = useState(false)
  const [newMessage, setNewMessage] = useState(false)

  const channels = useMemo(
    () => Object.values(conversations).filter((c) => c.type === "channel"),
    [conversations]
  )

  // Every bot, plus anyone you already have a DM with
  const dmRows = useMemo(() => {
    const rows = new Map<string, { user: User; conversation?: Conversation }>()
    Object.values(users)
      .filter((u) => u.isBot)
      .forEach((user) => rows.set(user._id, { user }))
    Object.values(conversations)
      .filter((c) => c.type === "dm")
      .forEach((conversation) => {
        const user = dmPartner(conversation, users, me?._id)
        if (user) rows.set(user._id, { user, conversation })
      })
    return [...rows.values()].sort((a, b) => a.user.displayName.localeCompare(b.user.displayName))
  }, [users, conversations, me?._id])

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-black leading-tight text-white">Dunder Mifflin</p>
          <p className="truncate text-xs text-sidebar-muted">Scranton Branch</p>
        </div>
        <Hint label="New message">
          <button
            type="button"
            aria-label="New message"
            onClick={() => setNewMessage(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <SquarePen className="h-4 w-4" />
          </button>
        </Hint>
      </div>

      <div className="scrollbar-sidebar flex-1 overflow-y-auto pb-4">
        <SectionHeader
          label="Channels"
          open={channelsOpen}
          onToggle={() => setChannelsOpen((v) => !v)}
        />
        {channelsOpen && (
          <ul className="space-y-px px-2">
            {channels.map((c) => {
              const active = c._id === activeId
              return (
                <li key={c._id}>
                  <Link href={`/workspace/${c._id}`} onClick={onNavigate} className={itemClass(active, c.unreadCount > 0)}>
                    <Hash className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="truncate">{c.name}</span>
                    {!active && <Badge count={c.mentionCount} />}
                  </Link>
                </li>
              )
            })}
            {!me?.isGuest && (
              <li>
                <button type="button" onClick={() => setAddChannel(true)} className={itemClass(false, false)}>
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                  Add channel
                </button>
              </li>
            )}
          </ul>
        )}

        <SectionHeader label="Direct messages" open={dmsOpen} onToggle={() => setDmsOpen((v) => !v)} />
        {dmsOpen && (
          <ul className="space-y-px px-2">
            {dmRows.map(({ user, conversation }) => {
              const active = !!conversation && conversation._id === activeId
              const unread = (conversation?.unreadCount ?? 0) > 0
              const content = (
                <>
                  <UserAvatar
                    user={user}
                    size="xs"
                    online={!!online[user._id]}
                    ringClassName={active ? "border-sidebar-active" : "border-sidebar"}
                  />
                  <span className="truncate">{user.displayName}</span>
                  {user.isGuest && <span className="text-xs opacity-60">temp</span>}
                  {!active && <Badge count={conversation?.mentionCount ?? 0} />}
                </>
              )
              return (
                <li key={user._id}>
                  {conversation ? (
                    <Link href={`/workspace/${conversation._id}`} onClick={onNavigate} className={itemClass(active, unread)}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDm(user._id).then(onNavigate).catch(() => null)}
                      className={itemClass(false, false)}
                    >
                      {content}
                    </button>
                  )}
                </li>
              )
            })}
            <li>
              <button type="button" onClick={() => setNewMessage(true)} className={itemClass(false, false)}>
                <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10">
                  <Plus className="h-3.5 w-3.5" />
                </span>
                Message a coworker
              </button>
            </li>
          </ul>
        )}
      </div>

      <AddChannelDialog open={addChannel} onOpenChange={setAddChannel} onDone={onNavigate} />
      <NewMessageDialog open={newMessage} onOpenChange={setNewMessage} onDone={onNavigate} />
    </div>
  )
}

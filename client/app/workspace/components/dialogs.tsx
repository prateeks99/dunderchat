"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { api, ApiError } from "@/lib/api"
import { useWorkspace } from "@/lib/store"
import type { Conversation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserAvatar } from "./user-avatar"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

// Opens (creating if needed) the DM with a user and navigates to it
export function useOpenDm() {
  const router = useRouter()
  const addConversation = useWorkspace((s) => s.addConversation)
  const conversations = useWorkspace((s) => s.conversations)
  const meId = useWorkspace((s) => s.me?._id)

  return async (userId: string) => {
    const existing = Object.values(conversations).find(
      (c) => c.type === "dm" && c.members.includes(userId) && c.members.includes(meId ?? "")
    )
    if (existing) return router.push(`/workspace/${existing._id}`)
    const { conversation } = await api<{ conversation: Conversation }>("/api/dms", {
      method: "POST",
      json: { userId },
    })
    addConversation({ ...conversation, unreadCount: 0, mentionCount: 0 })
    router.push(`/workspace/${conversation._id}`)
  }
}

export function AddChannelDialog({ open, onOpenChange, onDone }: DialogProps) {
  const router = useRouter()
  const addConversation = useWorkspace((s) => s.addConversation)
  const [name, setName] = useState("")
  const [topic, setTopic] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const slug = name.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { conversation } = await api<{ conversation: Conversation }>("/api/conversations", {
        method: "POST",
        json: { name: slug, topic },
      })
      addConversation({ ...conversation, unreadCount: 0, mentionCount: 0 })
      onOpenChange(false)
      setName("")
      setTopic("")
      onDone?.()
      router.push(`/workspace/${conversation._id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the channel")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create a channel</DialogTitle>
            <DialogDescription>Channels are where the office talks about a topic. Everyone can see them.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="channel-name">Name</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">#</span>
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. finer-things-club"
                className="pl-7"
                maxLength={30}
                autoFocus
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="channel-topic">
              Topic <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="channel-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's this channel about?"
              maxLength={200}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={!slug || saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function NewMessageDialog({ open, onOpenChange, onDone }: DialogProps) {
  const users = useWorkspace((s) => s.users)
  const online = useWorkspace((s) => s.online)
  const meId = useWorkspace((s) => s.me?._id)
  const openDm = useOpenDm()
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  const people = useMemo(() => {
    const q = query.trim().toLowerCase()
    return Object.values(users)
      .filter((u) => u._id !== meId)
      .filter((u) => !q || u.displayName.toLowerCase().includes(q) || u.username.includes(q))
      .sort((a, b) => Number(a.isGuest) - Number(b.isGuest) || a.displayName.localeCompare(b.displayName))
  }, [users, meId, query])

  const pick = async (userId: string) => {
    setError(null)
    try {
      await openDm(userId)
      onOpenChange(false)
      setQuery("")
      onDone?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't open that conversation")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Message a coworker</DialogTitle>
          <DialogDescription>Everyone at the Scranton branch, including other visitors.</DialogDescription>
        </DialogHeader>
        <div className="relative mx-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" className="pl-9" autoFocus />
        </div>
        {error && <p className="px-6 text-sm text-destructive">{error}</p>}
        <div className="scrollbar-thin max-h-80 overflow-y-auto px-3 pb-3">
          {people.map((u) => (
            <button
              key={u._id}
              type="button"
              onClick={() => pick(u._id)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
            >
              <UserAvatar user={u} size="sm" online={!!online[u._id]} ringClassName="border-popover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{u.displayName}</span>
                <span className="block truncate text-xs text-muted-foreground">{u.title || `@${u.username}`}</span>
              </span>
            </button>
          ))}
          {!people.length && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nobody by that name works here.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { firstName } from "@/lib/format"
import { typingKey, useWorkspace } from "@/lib/store"

const EMPTY: string[] = []

export function TypingIndicator({
  conversationId,
  parentId = null,
}: {
  conversationId: string
  parentId?: string | null
}) {
  const ids = useWorkspace((s) => s.typing[typingKey(conversationId, parentId)] ?? EMPTY)
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)
  const names = ids.filter((id) => id !== meId).map((id) => firstName(users[id]?.displayName ?? "Someone"))

  let label = ""
  if (names.length === 1) label = `${names[0]} is typing`
  else if (names.length === 2) label = `${names[0]} and ${names[1]} are typing`
  else if (names.length > 2) label = "Several people are typing"

  return (
    <div className="flex h-5 items-center gap-1.5 px-5 text-xs text-muted-foreground" aria-live="polite">
      {label && (
        <>
          <span className="flex gap-0.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1 w-1 animate-typing-dot rounded-full bg-muted-foreground"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
          <span>
            <span className="font-bold">{label.replace(/ (is|are) typing$/, "")}</span>
            {label.match(/ (is|are) typing$/)?.[0]}…
          </span>
        </>
      )}
    </div>
  )
}

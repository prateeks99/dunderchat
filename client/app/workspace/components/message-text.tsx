import { Fragment, useMemo } from "react"

import { useWorkspace } from "@/lib/store"
import { cn } from "@/lib/utils"

const TOKEN_RE = /(@[a-z0-9._-]+|https?:\/\/[^\s<]+[^\s<.,:;"')\]])/gi

// Renders message text with @mentions as chips and bare URLs as links
export function MessageText({ text }: { text: string }) {
  const users = useWorkspace((s) => s.users)
  const meId = useWorkspace((s) => s.me?._id)
  const byUsername = useMemo(
    () => new Map(Object.values(users).map((u) => [u.username.toLowerCase(), u])),
    [users]
  )

  const parts = text.split(TOKEN_RE)
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>
        if (part.startsWith("@")) {
          const user = byUsername.get(part.slice(1).toLowerCase())
          if (!user) return <Fragment key={i}>{part}</Fragment>
          return (
            <span
              key={i}
              className={cn(
                "rounded px-0.5 font-bold",
                user._id === meId
                  ? "bg-mention text-mention-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              @{user.displayName}
            </span>
          )
        }
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {part}
          </a>
        )
      })}
    </p>
  )
}

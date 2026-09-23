import { Hash } from "lucide-react"

import { getInitials } from "@/lib/format"
import { staff } from "@/lib/staff"

const person = (username: string) => staff.find((s) => s.username === username)!

const Avatar = ({ username, small }: { username: string; small?: boolean }) => {
  const p = person(username)
  return (
    <span
      aria-hidden
      className={
        small
          ? "flex h-4 w-4 shrink-0 items-center justify-center rounded text-[7px] font-black text-white"
          : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
      }
      style={{ backgroundColor: p.color }}
    >
      {getInitials(p.displayName)}
    </span>
  )
}

const messages = [
  {
    from: "dwight",
    at: "9:02 AM",
    text: "Quarterly numbers are in. I am first. Again. Please adjust your expectations accordingly.",
    reactions: [["🙄", 4]],
  },
  {
    from: "jim",
    at: "9:03 AM",
    text: "Congrats Dwight. Unrelated, but has anyone checked the fridge for a stapler?",
    reactions: [["😂", 6], ["👀", 2]],
  },
  {
    from: "michael",
    at: "9:05 AM",
    text: "Conference room in five. Bring your A-game and a snack for me.",
    replies: 4,
  },
] as const

// A static, non-interactive rendering of the workspace for the landing page hero
export function HeroPreview() {
  return (
    <div
      aria-label="Preview of the #sales channel"
      role="img"
      className="flex h-[420px] overflow-hidden rounded-xl border border-black/10 bg-background text-left shadow-[0_30px_80px_-20px_rgba(14,24,44,0.55)] dark:border-white/10"
    >
      <div className="hidden w-52 shrink-0 flex-col bg-sidebar py-3 text-sm text-sidebar-foreground sm:flex">
        <p className="px-4 font-black text-white">Dunder Mifflin</p>
        <p className="px-4 text-xs text-sidebar-muted">Scranton Branch</p>
        <p className="mt-4 px-4 text-xs font-bold text-sidebar-muted">Channels</p>
        <ul className="mt-1 space-y-px px-2">
          {["general", "sales", "accounting", "party-planning"].map((name) => (
            <li
              key={name}
              className={
                name === "sales"
                  ? "flex items-center gap-1.5 rounded-md bg-sidebar-active px-2 py-1 text-white"
                  : name === "general"
                    ? "flex items-center gap-1.5 px-2 py-1 font-black text-white"
                    : "flex items-center gap-1.5 px-2 py-1"
              }
            >
              <Hash className="h-3.5 w-3.5 opacity-70" />
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-4 px-4 text-xs font-bold text-sidebar-muted">Direct messages</p>
        <ul className="mt-1 space-y-px px-2">
          {["kevin", "pam", "creed"].map((u) => (
            <li key={u} className="flex items-center gap-2 px-2 py-1">
              <Avatar username={u} small />
              {person(u).displayName}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-black">sales</span>
          <span className="truncate text-xs text-muted-foreground">Leads, quotas, and who stole whose client.</span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden px-4 pb-2">
          {messages.map((m, i) => (
            <div key={m.from} className="arrive flex gap-2.5" style={{ animationDelay: `${300 + i * 700}ms` }}>
              <Avatar username={m.from} />
              <div className="min-w-0 text-sm">
                <p>
                  <span className="font-black">{person(m.from).displayName}</span>{" "}
                  <span className="text-xs text-muted-foreground">{m.at}</span>
                </p>
                <p className="leading-snug">{m.text}</p>
                {"reactions" in m && (
                  <div className="mt-1 flex gap-1">
                    {m.reactions.map(([emoji, n]) => (
                      <span key={emoji} className="rounded-full bg-muted px-2 text-xs font-bold leading-5">
                        {emoji} {n}
                      </span>
                    ))}
                  </div>
                )}
                {"replies" in m && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Avatar username="dwight" small />
                    <Avatar username="kevin" small />
                    {m.replies} replies
                  </p>
                )}
              </div>
            </div>
          ))}
          <p className="arrive text-xs text-muted-foreground" style={{ animationDelay: "2500ms" }}>
            <b>Dwight</b> is typing…
          </p>
        </div>
        <div className="mx-4 mb-4 rounded-lg border px-3 py-2.5 text-sm text-muted-foreground">Message #sales</div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  // "dark" when the button sits on the navy background, "light" on paper
  tone?: "dark" | "light"
  // Extra actions shown in the same row as the button (the hint goes under the whole row)
  children?: React.ReactNode
}

// Creates a temp (guest) account and drops the visitor straight into the workspace
export function JoinButton({ className, tone = "dark", children }: Props) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!joining) return setSlow(false)
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(timer)
  }, [joining])

  const join = async () => {
    setJoining(true)
    setError(null)
    try {
      await api("/api/auth/guest", { method: "POST" })
      router.push("/workspace")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't create a temp account."
      )
      setJoining(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={join}
          disabled={joining}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#F5D76E] px-6 text-base font-black text-[#1C2433] shadow-[0_2px_0_#C9A227] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D76E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B2A4A] active:translate-y-px disabled:cursor-wait disabled:opacity-80",
            className
          )}
        >
          {joining && <Loader2 className="h-4 w-4 animate-spin" />}
          {joining ? "Clocking in…" : "Join as a new hire"}
        </button>
        {children}
      </div>
      <p
        aria-live="polite"
        className={cn(
          "mt-2 min-h-5 text-sm",
          tone === "dark"
            ? error
              ? "text-red-300"
              : "text-white/75"
            : error
            ? "text-destructive"
            : "text-muted-foreground"
        )}
      >
        {error ??
          (slow
            ? "Waking up the office server. This can take up to a minute."
            : "No sign-up needed. Temp accounts are cleared after 24 hours.")}
      </p>
    </div>
  )
}

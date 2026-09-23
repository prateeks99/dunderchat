import { getInitials } from "@/lib/format"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

const sizes = {
  xs: "h-5 w-5 text-[9px] rounded",
  sm: "h-6 w-6 text-[10px] rounded-md",
  md: "h-9 w-9 text-sm rounded-lg",
  lg: "h-16 w-16 text-xl rounded-xl",
}

interface Props {
  user?: Pick<User, "displayName" | "color"> | null
  size?: keyof typeof sizes
  online?: boolean
  // Background behind the presence dot, so it reads as a cut-out
  ringClassName?: string
  className?: string
}

export function UserAvatar({ user, size = "md", online, ringClassName, className }: Props) {
  const name = user?.displayName ?? "Former temp"
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        aria-hidden
        className={cn("flex select-none items-center justify-center font-black text-white", sizes[size])}
        style={{ backgroundColor: user?.color ?? "#8A94A6" }}
      >
        {getInitials(name) || "?"}
      </span>
      {online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2",
            size === "lg" ? "h-4 w-4" : "h-2.5 w-2.5",
            online ? "bg-emerald-500" : "bg-transparent",
            ringClassName ?? "border-background"
          )}
          style={online ? undefined : { boxShadow: "inset 0 0 0 1.5px currentColor" }}
        />
      )}
    </span>
  )
}

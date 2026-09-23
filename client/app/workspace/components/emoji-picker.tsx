"use client"

import { useState } from "react"

import { REACTION_EMOJIS } from "@/lib/constants"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Props {
  onPick: (emoji: string) => void
  children: React.ReactNode
  align?: "start" | "center" | "end"
  onOpenChange?: (open: boolean) => void
}

export function EmojiPicker({ onPick, children, align = "end", onOpenChange }: Props) {
  const [open, setOpen] = useState(false)
  const change = (value: boolean) => {
    setOpen(value)
    onOpenChange?.(value)
  }
  return (
    <Popover open={open} onOpenChange={change}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted"
              onClick={() => {
                onPick(emoji)
                change(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

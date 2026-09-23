// Must match REACTION_EMOJIS in server/src/services/messages.mjs
export const REACTION_EMOJIS = [
  "👍", "👎", "😂", "❤️", "🎉", "😮", "😢", "😡",
  "🔥", "👀", "🙏", "💯", "✅", "❌", "🤔", "😬",
  "🙄", "😐", "🥳", "📄", "🧻", "🌶️", "🥨", "🥬",
]

export const QUICK_REACTIONS = ["👍", "😂", "🎉", "👀"]

// Consecutive messages from the same person within this window are grouped
export const GROUP_WINDOW_MS = 5 * 60 * 1000

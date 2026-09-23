export const getInitials = (name: string): string =>
  name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()

export const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

const ordinal = (n: number) => {
  const suffix = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
}

// Day divider label: "Today", "Yesterday", or "Monday, September 21st"
export const getDayLabel = (date: string | Date): string => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  const weekday = d.toLocaleDateString([], { weekday: "long" })
  const month = d.toLocaleDateString([], { month: "long" })
  const year = d.getFullYear() !== today.getFullYear() ? `, ${d.getFullYear()}` : ""
  return `${weekday}, ${month} ${ordinal(d.getDate())}${year}`
}

export const isSameDay = (a: string | Date, b: string | Date) =>
  new Date(a).toDateString() === new Date(b).toDateString()

export const firstName = (name: string) => name.split(" ")[0]

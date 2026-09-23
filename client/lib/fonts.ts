import { JetBrains_Mono as FontMono, Lato as FontSans } from "next/font/google"

export const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-sans",
})

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

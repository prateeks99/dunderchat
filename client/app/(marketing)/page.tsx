import Link from "next/link"

import { siteConfig } from "@/config/site"
import { getInitials } from "@/lib/format"
import { staff } from "@/lib/staff"
import { Icons } from "@/components/icons"
import { JoinButton } from "@/components/join-button"
import { HeroPreview } from "./hero-preview"

const features = [
  {
    title: "A channel for every department",
    body: "#sales, #accounting, #party-planning and the rest come with a few days of history, so you're never walking into an empty room.",
  },
  {
    title: "Coworkers who answer",
    body: "@mention anyone or send them a DM. They type, pause, and reply in character. Some of them also react to certain words.",
  },
  {
    title: "Threads and reactions",
    body: "Reply to a message in a thread, react with 🥨 or 🌶️, and hover a reaction to see who else did.",
  },
  {
    title: "Other visitors, live",
    body: "Everyone who drops by shares the same office. You'll see who's online, who's typing, and messages the moment they're sent.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[#1B2A4A] pb-40 text-white md:pb-56">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-black">
            <span className="rounded-lg bg-white/10 p-1">
              <Icons.logo className="h-7 w-7" />
            </span>
            <span className="text-lg">Dunder Mifflin Infinity</span>
          </Link>
          <Link
            href="/signin"
            className="rounded-md px-3 py-2 text-sm font-bold text-white/85 hover:bg-white/10 hover:text-white"
          >
            Sign in
          </Link>
        </header>

        <div className="mx-auto max-w-6xl px-4 pt-10 md:px-8 md:pt-20">
          <h1 className="max-w-[14ch] text-5xl font-black leading-[1.02] tracking-[-0.03em] md:text-7xl">
            Pull up a chair at the Scranton branch.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/80">
            A Slack-style workspace where Michael, Dwight, Jim and the rest of the office are already
            chatting. Jump into a channel, start a thread, or DM Creed if you&apos;re feeling brave.
          </p>
          <div className="mt-8">
            <JoinButton>
              <Link
                href="/signin"
                className="inline-flex h-12 items-center rounded-lg border border-white/25 px-6 font-bold text-white hover:bg-white/10"
              >
                Sign in
              </Link>
            </JoinButton>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-32 max-w-6xl px-4 md:-mt-44 md:px-8">
        <HeroPreview />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Your new coworkers</h2>
            <p className="mt-3 max-w-[40ch] text-muted-foreground">
              Thirteen bots, each with their own lines, habits and trigger words. Try saying
              &ldquo;beets&rdquo; anywhere near Dwight.
            </p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {staff.map((p) => (
              <li key={p.username} className="flex items-center gap-3 border-b py-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {getInitials(p.displayName)}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{p.displayName}</span>
                  <span className="block truncate text-sm text-muted-foreground">{p.title}</span>
                </span>
                <span className="ml-auto hidden text-sm text-muted-foreground lg:block">@{p.username}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="text-3xl font-black tracking-tight">How the office works</h2>
          <dl className="mt-10 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title}>
                <dt className="text-lg font-black">{f.title}</dt>
                <dd className="mt-2 max-w-[48ch] leading-relaxed text-muted-foreground">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Your desk is ready.</h2>
          <p className="mt-2 text-muted-foreground">It&apos;s the one next to Kevin. Sorry.</p>
        </div>
        <div className="rounded-xl bg-[#1B2A4A] p-5 text-white">
          <JoinButton />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between md:px-8">
          <p>A fan project. Not affiliated with NBC, Universal or The Office.</p>
          <p>
            Built by{" "}
            <a href={siteConfig.links.author} className="font-bold text-foreground hover:underline">
              prateeks99
            </a>
            . Source on{" "}
            <a href={siteConfig.links.github} className="font-bold text-foreground hover:underline">
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { api, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { JoinButton } from "@/components/join-button"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const signInSchema = z.object({
  username: z.string().trim().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
})

const registerSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your full name").max(40, "Keep it under 40 characters"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Use at least 5 characters")
    .max(32, "Use at most 32 characters")
    .regex(/^[a-z0-9._-]+$/, "Use letters, numbers, dots, dashes or underscores"),
  password: z.string().min(6, "Use at least 6 characters"),
})

const NOTICES: Record<string, string> = {
  github: "GitHub sign-in didn't complete. Try again, or use a username and password.",
  "github-disabled": "GitHub sign-in isn't set up on this server yet.",
  expired: "Your temp contract has ended. Join again or create a full account.",
}

function SignInForm({ onError }: { onError: (message: string | null) => void }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    onError(null)
    try {
      await api("/api/auth", { method: "POST", json: values })
      router.push("/workspace")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't sign you in.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input autoComplete="username" autoCapitalize="none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}

function RegisterForm({ onError }: { onError: (message: string | null) => void }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", username: "", password: "" },
  })

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    onError(null)
    try {
      await api("/api/users", { method: "POST", json: values })
      router.push("/workspace")
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't create your account.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Holly Flax" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input autoComplete="username" autoCapitalize="none" placeholder="hollyflax" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </Form>
  )
}

function SignInCard() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<"signin" | "register">(
    params.get("mode") === "register" ? "register" : "signin"
  )
  const [github, setGithub] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const notice = NOTICES[params.get("error") ?? ""] ?? (params.get("expired") ? NOTICES.expired : null)

  useEffect(() => {
    // Already signed in? Go straight to the office (unless a temp came here to register)
    if (params.get("mode") !== "register") {
      api("/api/auth/status")
        .then(() => router.replace("/workspace"))
        .catch(() => null)
    }
    api<{ github: boolean }>("/api/auth/providers")
      .then((p) => setGithub(p.github))
      .catch(() => null)
  }, [params, router])

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" aria-label="Home" className="mb-5 rounded-2xl bg-sidebar p-2.5 text-white">
          <Icons.logo className="h-10 w-10" />
        </Link>
        <h1 className="text-3xl font-black tracking-tight">
          {mode === "signin" ? "Sign in to Dunder Mifflin" : "Get hired full-time"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {mode === "signin"
            ? "Scranton branch. The best branch."
            : "A full account keeps your messages and lets you create channels."}
        </p>
      </div>

      {notice && (
        <p className="mb-4 rounded-md bg-mention px-3 py-2 text-sm text-mention-foreground">{notice}</p>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {mode === "signin" && (
          <>
            <JoinButton tone="light" className="w-full" />
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 border-t" />
              or sign in with an account
              <span className="flex-1 border-t" />
            </div>
          </>
        )}

        {mode === "signin" ? <SignInForm onError={setError} /> : <RegisterForm onError={setError} />}
        {error && (
          <p role="alert" className="mt-3 text-sm font-bold text-destructive">
            {error}
          </p>
        )}

        {github && (
          <a
            href="/api/auth/github"
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border font-bold hover:bg-muted"
          >
            <Icons.gitHub className="h-4 w-4" /> Continue with GitHub
          </a>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here and want to stay?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError(null)
            setMode(mode === "signin" ? "register" : "signin")
          }}
          className={cn("font-bold text-primary hover:underline")}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Suspense>
        <SignInCard />
      </Suspense>
    </main>
  )
}

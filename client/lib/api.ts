// Same-origin by default: /api/* is proxied to the API server (see next.config.mjs)
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export async function api<T>(
  path: string,
  { json, ...init }: RequestInit & { json?: unknown } = {}
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(json !== undefined && { "Content-Type": "application/json" }),
        ...init.headers,
      },
      body: json !== undefined ? JSON.stringify(json) : init.body,
    })
  } catch {
    throw new ApiError("Can't reach the office right now. Try again in a moment.", 0)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.error || `Request failed (${response.status})`, response.status)
  }
  return body as T
}

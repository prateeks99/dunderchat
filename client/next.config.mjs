// REST calls go to /api on this origin and are proxied to the API server, which keeps
// the session cookie first-party (Vercel and Render are different sites).
const apiOrigin = (process.env.API_ORIGIN || "http://localhost:5000").replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig

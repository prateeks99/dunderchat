import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";
// Comma-separated; the first is the canonical site used for redirects, the rest
// (e.g. Vercel preview URLs) are only allowed to open sockets
const clientUrls = (process.env.CLIENT_URL || "http://localhost:3000")
	.split(",")
	.map((url) => url.trim().replace(/\/$/, ""))
	.filter(Boolean);
const clientUrl = clientUrls[0];

export const config = {
	isProd,
	port: process.env.PORT || process.env.SERVER_PORT || 5000,
	mongoUri: process.env.MONGODB_URI,
	clientUrl,
	clientUrls,
	sessionSecret: process.env.SESSION_SECRET || (isProd ? "" : "dev-only-session-secret"),
	// Number of proxy hops in front of the app (Render's load balancer = 1)
	trustProxy: Number(process.env.TRUST_PROXY ?? 1),
	guestTtlHours: Number(process.env.GUEST_TTL_HOURS ?? 24),
	github: {
		clientId: process.env.GITHUB_CLIENT_ID,
		clientSecret: process.env.GITHUB_CLIENT_SECRET,
		// The client proxies /api/* to this server, so the callback lives on the client's domain
		callbackUrl:
			process.env.GITHUB_CALLBACK_URL || `${clientUrl}/api/auth/github/redirect`,
	},
};

config.githubEnabled = Boolean(
	config.github.clientId &&
		config.github.clientSecret &&
		config.github.clientId !== "your_client_id"
);

if (!config.mongoUri) throw new Error("MONGODB_URI is not set");
if (!config.sessionSecret) throw new Error("SESSION_SECRET must be set in production");

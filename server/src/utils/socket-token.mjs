import crypto from "node:crypto";
import { config } from "../config.mjs";

// The socket connects straight to the API server (Vercel can't proxy websockets),
// so it can't rely on the session cookie. Instead the client fetches this short-lived
// signed token through the proxied REST API and passes it in the handshake.
const TOKEN_TTL_MS = 5 * 60 * 1000;

const sign = (payload) =>
	crypto.createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");

export const createSocketToken = (userId) => {
	const payload = `${userId}.${Date.now() + TOKEN_TTL_MS}`;
	return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
};

// Returns the user id, or null if the token is invalid or expired
export const verifySocketToken = (token) => {
	if (typeof token !== "string") return null;
	const [encoded, signature] = token.split(".");
	if (!encoded || !signature) return null;

	const payload = Buffer.from(encoded, "base64url").toString();
	const expected = sign(payload);
	if (
		signature.length !== expected.length ||
		!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
	) {
		return null;
	}

	const [userId, expires] = payload.split(".");
	return Number(expires) > Date.now() ? userId : null;
};

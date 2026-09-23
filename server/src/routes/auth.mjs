import passport from "passport";
import { Router } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { config } from "../config.mjs";
import { createGuest } from "../services/users.mjs";
import { createSocketToken } from "../utils/socket-token.mjs";
import { handle, requireAuth } from "../utils/auth.mjs";

const router = Router();

// Behind Vercel's proxy every request shares a few egress IPs, so key on the original client
const clientKey = (request) => {
	const forwarded = request.headers["x-forwarded-for"]?.split(",")[0]?.trim();
	return ipKeyGenerator(forwarded || request.ip);
};

const guestLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	keyGenerator: clientKey,
	message: { error: "Too many new temps from here. Try again in a few minutes." },
	validate: { xForwardedForHeader: false },
});

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	keyGenerator: clientKey,
	message: { error: "Too many sign-in attempts. Try again in a few minutes." },
	validate: { xForwardedForHeader: false },
});

const logIn = (request, user) =>
	new Promise((resolve, reject) =>
		request.login(user, (err) => (err ? reject(err) : resolve()))
	);

router.post("/api/auth", loginLimiter, (request, response, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);
		if (!user) {
			return response.status(401).json({ error: info?.message || "Wrong username or password" });
		}
		request.login(user, (loginErr) =>
			loginErr ? next(loginErr) : response.json({ user: user.toPublic() })
		);
	})(request, response, next);
});

router.post(
	"/api/auth/guest",
	guestLimiter,
	handle(async (request, response) => {
		const guest = await createGuest();
		await logIn(request, guest);
		response.status(201).json({ user: guest.toPublic() });
	})
);

router.get("/api/auth/status", (request, response) =>
	request.user
		? response.json({ user: request.user.toPublic() })
		: response.status(401).json({ error: "Not signed in" })
);

router.get("/api/auth/providers", (request, response) =>
	response.json({ github: config.githubEnabled })
);

router.get("/api/auth/socket-token", requireAuth, (request, response) =>
	response.json({ token: createSocketToken(request.user._id.toString()) })
);

router.post("/api/auth/logout", (request, response, next) => {
	request.logout((err) => {
		if (err) return next(err);
		request.session.destroy(() => {
			response.clearCookie("connect.sid");
			response.json({ ok: true });
		});
	});
});

if (config.githubEnabled) {
	router.get("/api/auth/github", passport.authenticate("github"));
	router.get(
		"/api/auth/github/redirect",
		passport.authenticate("github", {
			successRedirect: `${config.clientUrl}/workspace`,
			failureRedirect: `${config.clientUrl}/signin?error=github`,
		})
	);
} else {
	router.get("/api/auth/github", (request, response) =>
		response.redirect(`${config.clientUrl}/signin?error=github-disabled`)
	);
}

export default router;

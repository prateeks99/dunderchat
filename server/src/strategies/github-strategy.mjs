import passport from "passport";
import { Strategy } from "passport-github2";
import { config } from "../config.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { announceNewUser, randomHumanColor } from "../services/users.mjs";

// GitHub usernames can collide with local accounts or bots, so fall back to a suffixed name
async function availableUsername(base) {
	const clean = String(base || "github-user").toLowerCase().replace(/[^a-z0-9._-]/g, "");
	for (let i = 0; i < 20; i++) {
		const candidate = i === 0 ? clean : `${clean}${i + 1}`;
		if (!(await User.exists({ username: candidate }))) return candidate;
	}
	return `${clean}-${Date.now()}`;
}

if (config.githubEnabled) {
	passport.use(
		new Strategy(
			{
				clientID: config.github.clientId,
				clientSecret: config.github.clientSecret,
				callbackURL: config.github.callbackUrl,
				scope: ["read:user"],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const findUser = await User.findOne({ githubId: profile.id });
					if (findUser) return done(null, findUser);

					const newUser = await User.create({
						username: await availableUsername(profile.username),
						displayName: profile.displayName || profile.username,
						githubId: profile.id,
						title: "New Hire",
						color: randomHumanColor(),
					});
					announceNewUser(newUser);
					return done(null, newUser);
				} catch (err) {
					return done(err, null);
				}
			}
		)
	);
}

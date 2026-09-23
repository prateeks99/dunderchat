import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/bcrypt.mjs";

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const findUser = await User.findById(id);
		if (!findUser) {
			return done(null, null);
		}
		done(null, findUser);
	} catch (err) {
		done(err, null);
	}
});

export default passport.use(
	new Strategy(async (username, password, done) => {
		try {
			const findUser = await User.findOne({
				username: String(username).trim().toLowerCase(),
				isBot: false,
				isGuest: false,
			}).select("+password");
			if (!findUser?.password || !comparePassword(password, findUser.password)) {
				return done(null, false, { message: "Wrong username or password" });
			}
			done(null, findUser);
		} catch (err) {
			done(err, null);
		}
	})
);

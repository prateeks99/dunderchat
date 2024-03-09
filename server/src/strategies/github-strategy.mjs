import passport from "passport";
import { Strategy } from "passport-github2";
import { User } from "../mongoose/schemas/user.mjs";
import 'dotenv/config'

const githubClientID = process.env.GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

export default passport.use(
	new Strategy(
		{
			clientID: githubClientID,
			clientSecret: githubClientSecret,
			callbackURL: "http://localhost:5000/api/auth/github/redirect",
			scope: ["identify"],
		},
		async (accessToken, refreshToken, profile, done) => {
			let findUser;
			try {
				findUser = await User.findOne({ githubId: profile.id });
			} catch (err) {
				return done(err, null);
			}
			try {
				if (!findUser) {
					console.log(profile)
					const newUser = new User({
						username: profile.username,
						displayName: profile.displayName,
						githubId: profile.id,
					});
					const newSavedUser = await newUser.save();
					return done(null, newSavedUser);
				}
				return done(null, findUser);
			} catch (err) {
				return done(err, null);
			}
		}
	)
);
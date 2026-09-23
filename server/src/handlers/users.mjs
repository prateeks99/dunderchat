import { matchedData, validationResult } from "express-validator";
import { hashPassword } from "../utils/bcrypt.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { announceNewUser, randomHumanColor } from "../services/users.mjs";

// Handles creating user and hashing the password, then signs the new user in
export const createUserHandler = async (request, response) => {
	const result = validationResult(request);
	if (!result.isEmpty()) {
		return response.status(400).json({ error: result.array()[0].msg, errors: result.array() });
	}
	const data = matchedData(request);
	data.password = hashPassword(data.password);
	try {
		const savedUser = await User.create({
			...data,
			title: "New Hire",
			color: randomHumanColor(),
		});
		request.login(savedUser, (err) => {
			if (err) return response.status(500).json({ error: "Account created, but sign-in failed" });
			announceNewUser(savedUser);
			return response.status(201).json({ user: savedUser.toPublic() });
		});
	} catch (err) {
		if (err.code === 11000) {
			return response.status(409).json({ error: "That username is taken" });
		}
		console.error(err);
		return response.status(500).json({ error: "Internal Server Error" });
	}
};

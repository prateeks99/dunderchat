import { matchedData, validationResult } from "express-validator";
import { hashPassword } from "../utils/bcrypt.mjs";
import { User } from "../mongoose/schemas/user.mjs";

// Handles creating user and hashing the password
export const createUserHandler = async (request, response) => {
	const result = validationResult(request);
	if (!result.isEmpty()) return response.status(400).send(result.array());
	const data = matchedData(request);
	data.password = hashPassword(data.password);
	const newUser = new User(data);
	try {
		const savedUser = await newUser.save();
		return response.status(201).send(savedUser);
	} catch (err) {
		return response.sendStatus(400);
	}
};
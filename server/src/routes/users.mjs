import { Router } from "express";
import { checkSchema } from "express-validator";
import { User } from "../mongoose/schemas/user.mjs";
import { createUserValidationSchema } from "../utils/validation.mjs";
import { createUserHandler } from "../handlers/users.mjs";

const router = Router();

const isLoggedIn = (request, response, next) => {
	request.user ? next() : response.status(401);
}

// Route to CREATE / REGISTER user
router.post(
	"/api/users",
	checkSchema(createUserValidationSchema),
	createUserHandler
);

// Route to GET all users
router.get("/api/users", async(request, response) => {
	try {
		const allUsers = await User.find();
		return response.status(201).json(allUsers);
	} catch(err) {
		console.log("Error: unable to fetch Users - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

// Route to GET user by id
router.get("/api/users/:id", isLoggedIn, async(request, response) => {
	try {
		const findUser = await User.findOne({ _id: request.params.id  })
		return response.status(201).json(findUser);
	} catch(err) {
		console.log("Error: unable to fetch user - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

// Route to UPDATE user by id
router.put("/api/users/:id", isLoggedIn, async(request, response) => {
	try {
		const updateUser = await User.findOne({ _id: request.params.id })
		if (request.body.username) {
			updateUser.username = request.body.username
		}
		if (request.body.displayName) {
			updateUser.displayName = request.body.displayName
		}
		await updateUser.save()
		return response.status(200).json(updateUser);
	} catch(err) {
		console.log("Error: unable to fetch user - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

// Route to DELETE user by id
router.delete("/api/users/:id", isLoggedIn, async(request, response) => {
	try {
		await User.deleteOne({ _id: request.params.id })
		return response.status(204).send()
	} catch(err) {
		console.log("Error: unable to fetch user - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

export default router;
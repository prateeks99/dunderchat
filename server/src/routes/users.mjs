import { Router } from "express";
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../utils/validation.mjs";
import { createUserHandler } from "../handlers/users.mjs";

const router = Router();

// Route to CREATE / REGISTER user (also signs them in)
router.post(
	"/api/users",
	checkSchema(createUserValidationSchema),
	createUserHandler
);

export default router;

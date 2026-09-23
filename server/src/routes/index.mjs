import { Router } from "express";
import usersRouter from "./users.mjs";
import authRouter from "./auth.mjs";
import conversationsRouter from "./conversations.mjs";

const router = Router();

router.get("/api/health", (request, response) => response.json({ ok: true }));

router.use(usersRouter);
router.use(authRouter);
router.use(conversationsRouter);

export default router;

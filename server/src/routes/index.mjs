import { Router } from "express";
import usersRouter from "./users.mjs";
import authRouter from "./auth.mjs";
import messageRouter from "./messages.mjs";
import roomsRouter from "./rooms.mjs";

const router = Router();

router.use(usersRouter);
router.use(authRouter);
router.use(messageRouter);
router.use(roomsRouter);

export default router;
import express from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { config } from "./config.mjs";
import { setIo } from "./realtime.mjs";
import { registerSocketHandlers } from "./socket.mjs";
import "./strategies/local-strategy.mjs";
import "./strategies/github-strategy.mjs";

export function createApp() {
	const app = express();
	const httpServer = createServer(app);

	// REST calls arrive through the client's /api proxy; the socket connects directly
	const io = new Server(httpServer, {
		cors: {
			origin: config.clientUrls,
			methods: ["GET", "POST"],
		},
	});
	setIo(io);
	registerSocketHandlers(io);

	app.set("trust proxy", config.trustProxy);
	app.use(express.json({ limit: "32kb" }));
	app.use(cookieParser());
	app.use(
		session({
			secret: config.sessionSecret,
			saveUninitialized: false,
			resave: false,
			rolling: true,
			cookie: {
				maxAge: 7 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				sameSite: "lax",
				secure: config.isProd,
			},
			store: MongoStore.create({
				client: mongoose.connection.getClient(),
			}),
		})
	);

	app.use(
		cors({
			origin: config.clientUrls,
			credentials: true,
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());

	app.use(routes);

	return httpServer;
}

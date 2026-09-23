import mongoose from "mongoose";
import { config } from "./config.mjs";
import { createApp } from "./app.mjs";
import { seed } from "./seed/seed.mjs";
import { startBots } from "./bots/engine.mjs";
import { sweepExpiredGuests } from "./services/users.mjs";

const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

async function main() {
	await mongoose.connect(config.mongoUri);
	console.log("Connected to MongoDB");

	await seed();
	const app = createApp();
	await startBots();

	const sweep = () => sweepExpiredGuests().catch((err) => console.error("Sweeper failed", err));
	sweep();
	setInterval(sweep, SWEEP_INTERVAL_MS);

	app.listen(config.port, () => {
		console.log(`Running on Port ${config.port}`);
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

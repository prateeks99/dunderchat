import mongoose from "mongoose";
import { createApp } from "./app.mjs";
import "dotenv/config"

const mongodb_URI = process.env.MONGODB_URI

mongoose
	.connect(mongodb_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.log(`Error: ${err}`));

const app = createApp();

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, () => {
	console.log(`Running on Port ${PORT}`);
});
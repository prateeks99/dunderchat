import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	username: {
		type: mongoose.Schema.Types.String,
		required: true,
		unique: true,
	},
	displayName: mongoose.Schema.Types.String,
	password: {
		type: mongoose.Schema.Types.String
	},
	githubId: mongoose.Schema.Types.String,
});

export const User = mongoose.model("User", UserSchema);
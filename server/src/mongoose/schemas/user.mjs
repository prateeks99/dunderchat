import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	username: {
		type: mongoose.Schema.Types.String,
		required: true,
		unique: true,
		trim: true,
	},
	displayName: mongoose.Schema.Types.String,
	password: {
		type: mongoose.Schema.Types.String,
		select: false,
	},
	githubId: mongoose.Schema.Types.String,
	title: {
		type: mongoose.Schema.Types.String,
		default: "",
	},
	color: {
		type: mongoose.Schema.Types.String,
		default: "#4A6FA5",
	},
	isBot: {
		type: mongoose.Schema.Types.Boolean,
		default: false,
	},
	isGuest: {
		type: mongoose.Schema.Types.Boolean,
		default: false,
	},
	// Guests only: removed (with their messages) by the sweeper after this time
	expiresAt: mongoose.Schema.Types.Date,
	createdAt: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

UserSchema.index({ isGuest: 1, expiresAt: 1 });

// Public shape sent to clients
UserSchema.methods.toPublic = function () {
	return {
		_id: this._id.toString(),
		username: this.username,
		displayName: this.displayName || this.username,
		title: this.title,
		color: this.color,
		isBot: this.isBot,
		isGuest: this.isGuest,
	};
};

export const User = mongoose.model("User", UserSchema);

import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
	type: {
		type: mongoose.Schema.Types.String,
		enum: ["channel", "dm"],
		required: true,
	},
	// Channels only
	name: mongoose.Schema.Types.String,
	topic: {
		type: mongoose.Schema.Types.String,
		default: "",
	},
	isDefault: {
		type: mongoose.Schema.Types.Boolean,
		default: false,
	},
	// DMs only: the two participants, and their sorted ids joined with ":"
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	dmKey: mongoose.Schema.Types.String,
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	createdAt: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

ConversationSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { type: "channel" } });
ConversationSchema.index({ dmKey: 1 }, { unique: true, partialFilterExpression: { type: "dm" } });
ConversationSchema.index({ members: 1 });

export const dmKeyFor = (a, b) => [a.toString(), b.toString()].sort().join(":");

export const Conversation = mongoose.model("Conversation", ConversationSchema);

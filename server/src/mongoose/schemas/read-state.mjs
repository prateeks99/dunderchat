import mongoose from "mongoose";

const ReadStateSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	conversationId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Conversation",
		required: true,
	},
	lastReadAt: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

ReadStateSchema.index({ userId: 1, conversationId: 1 }, { unique: true });

export const ReadState = mongoose.model("ReadState", ReadStateSchema);

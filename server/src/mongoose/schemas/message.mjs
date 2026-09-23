import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
	{
		emoji: { type: mongoose.Schema.Types.String, required: true },
		userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	{ _id: false }
);

const MessageSchema = new mongoose.Schema({
	conversationId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Conversation",
		required: true,
	},
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	text: {
		type: mongoose.Schema.Types.String,
		required: true,
	},
	mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	// Thread replies point at their top-level parent
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Message",
		default: null,
	},
	replyCount: {
		type: mongoose.Schema.Types.Number,
		default: 0,
	},
	lastReplyAt: mongoose.Schema.Types.Date,
	replyUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	reactions: [ReactionSchema],
	// Bot replies and welcomes: who they were addressed to (removed with expired guests)
	aboutUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
	createdAt: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},
});

MessageSchema.index({ conversationId: 1, parentId: 1, createdAt: -1 });
MessageSchema.index({ parentId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ aboutUserId: 1 }, { sparse: true });

MessageSchema.methods.toPublic = function () {
	return {
		_id: this._id.toString(),
		conversationId: this.conversationId.toString(),
		senderId: this.senderId.toString(),
		text: this.text,
		mentions: this.mentions.map(String),
		parentId: this.parentId ? this.parentId.toString() : null,
		replyCount: this.replyCount,
		lastReplyAt: this.lastReplyAt,
		replyUserIds: this.replyUserIds.map(String),
		reactions: this.reactions.map((r) => ({ emoji: r.emoji, userIds: r.userIds.map(String) })),
		createdAt: this.createdAt,
	};
};

export const Message = mongoose.model("Message", MessageSchema);

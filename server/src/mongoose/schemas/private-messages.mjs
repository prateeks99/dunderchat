import mongoose from "mongoose";

const PrivateMessageSchema = new mongoose.Schema({
    senderId: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    senderName: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    recipientId: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    recipientName: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    content: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    timestamp: {
        default: Date.now,
		type: mongoose.Schema.Types.String
	}
});

export const PrivateMessage = mongoose.model("private-messages", PrivateMessageSchema);
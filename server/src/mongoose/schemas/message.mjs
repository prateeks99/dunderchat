import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
	name:{
		type: mongoose.Schema.Types.String,
		required: true
	},
	room: {
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

export const Message = mongoose.model("messages", MessageSchema);
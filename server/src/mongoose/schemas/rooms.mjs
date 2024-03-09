import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    info: {
		type: mongoose.Schema.Types.String,
		required: true
	},
    members: [],
    timestamp: {
        default: Date.now,
		type: mongoose.Schema.Types.String
	}
});

export const Room = mongoose.model("rooms", RoomSchema);
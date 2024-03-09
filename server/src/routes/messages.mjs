import { Router } from "express";
import { Message } from "../mongoose/schemas/message.mjs"
import { PrivateMessage } from "../mongoose/schemas/private-messages.mjs";

const router = Router();

function isLoggedIn(request, response, next) {
	request.user ? next() : response.status(401);
};

// Route to GET room messages
router.get("/api/messages/:room", async(request, response) => {
    try {
        const roomMessages = await Message.find({ 
            room: request.params.room 
        }).sort({ timestamp: 1 });
        return response.status(201).json(roomMessages);
    } catch(err) {
		console.log("Error: unable to fetch messages - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

// Route to GET private messages
router.get("/api/privatemessages/:userId/:friendId", async(request, response) => {
    try {
        const { userId, friendId } = request.params;
        const messages = await PrivateMessage.find({
            $or: [
                { senderId: userId, recipientId: friendId },
                { senderId: friendId, recipientId: userId }
            ]
        }).sort({ timestamp: 1 });
        return response.status(201).json(messages);
    } catch(err) {
		console.log("Error: unable to fetch private messages - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

export default router;
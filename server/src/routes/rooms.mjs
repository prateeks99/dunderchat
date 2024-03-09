import { Router } from "express";
import { Room } from "../mongoose/schemas/rooms.mjs";

const router = Router();

// Route to GET all rooms
router.get('/api/rooms', async(request, response) => {
    try {
        const allRooms = await Room.find();
        return response.status(201).json(allRooms);
    } catch(error) {
        console.log("Error: unable to fetch rooms - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
    }
})

// Route to CREATE room
router.post('/api/rooms', async(request, response) => {
    try {
        const { name, info, members } = request.body;
        const newRoom = new Room({
            name,
            info,
            members
        });
        const createdRoom = await newRoom.save();
        return response.status(201).json(createdRoom);
    } catch(error) {
        console.log("Error: unable to create room - \n", error)
		return response.status(500).json({ error: 'Internal Server Error' });
    }
})

// Route to DELETE room by id
router.delete("/api/room/:id", async(request, response) => {
	try {
		await Room.deleteOne({ _id: request.params.id })
		return response.status(204).send()
	} catch(err) {
		console.log("Error: unable to delete room - \n", err)
		return response.status(500).json({ error: 'Internal Server Error' });
	}
});

export default router;
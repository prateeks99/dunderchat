import express from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from 'http';
import { Message } from "./mongoose/schemas/message.mjs"
import { PrivateMessage } from "./mongoose/schemas/private-messages.mjs";
import "./strategies/local-strategy.mjs";
import "./strategies/github-strategy.mjs";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: [ "GET", "POST" ]
    }
});

const socketList = {};

// SocketIO configuration
io.on('connection', (socket) => {
    console.log(`Socket: User connected - ${socket.id}`)
    socket.join('general')
    socket.join('sales')
    socket.join('build')

    socket.on('send-id', function(id) {
        socket.userId = id;
    });

    socket.on('send-name', function(name) {
        socket.username = name;
        socketList[name] = socket.id;
    });

    socket.on('join-room', async(data) => {
        socket.join(data);
        console.log(`User ${socket.username} joined Room ${data}`)
        // update room members
    })

    socket.on('leave-room', async(data) => {
        socket.leave(data.room);
        // update room members
    })
      
    socket.on('room-message', async (data) => {
        console.log(`Socket: Room message recieved`);
        const rooms = io.of("/").adapter.rooms;
        console.log(rooms)
        try {
            const newMessage = Message({
                name : data.name,
                room: data.room,
                content: data.content,
                timestamp: new Date(),
            });
            await newMessage.save();
            console.log(`DB: Saving room message to DB \n`, newMessage);
            io.to(data.room).emit('room-message',newMessage)
        } catch(error) {
            console.error('Socket: Error handling room message:', error);
        }
    });

    socket.on('private-message', async (data) => {
        console.log(`Socket: Private message recieved`);
        try {
            const newPrivateMessage = new PrivateMessage({
                senderId: socket.userId,
                senderName: data.senderName,
                recipientId: data.recipientId,
                recipientName: data.recipientName,
                content: data.content,
                timestamp: new Date(),
            });
            console.log(socket.id)
            socket.emit('private-message', newPrivateMessage);
            console.log(socketList)
            if (socket.id !== socketList[data.recipientName]) {
                io.to(socketList[data.recipientName]).emit('private-message', newPrivateMessage);
                console.log(`Socket: Sending private message to ${data.recipientName} \n`, newPrivateMessage);
            }
            await newPrivateMessage.save();
            
        } catch (error) {
          console.error('Socket: Error handling private message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket: User disconnected - ${socket.id}`);
    });
});

export function createApp() {
	app.use(express.json());
	app.use(cookieParser("express"));
	app.use(
		session({
			secret: "prateeks99-chatjs",
			saveUninitialized: true,
			resave: false,
			cookie: {
				maxAge: 60000 * 60,
			},
			store: MongoStore.create({
				client: mongoose.connection.getClient(),
			}),
		})
	);
	
	// Enable CORS for development
	app.use(cors({
		origin: "http://localhost:3000",
		credentials: true
	}));

	app.use(passport.initialize());
	app.use(passport.session());

	app.use(routes);

	return httpServer;
}
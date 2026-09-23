import { Conversation } from "./mongoose/schemas/conversation.mjs";
import { User } from "./mongoose/schemas/user.mjs";
import { markOffline, markOnline, roomFor, userRoom } from "./realtime.mjs";
import { canAccess, markRead, postMessage, toggleReaction } from "./services/messages.mjs";
import { isValidId } from "./utils/auth.mjs";
import { verifySocketToken } from "./utils/socket-token.mjs";

// At most 8 messages per 10 seconds per socket
const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT = 8;

async function loadAccessible(user, conversationId) {
	if (!isValidId(conversationId)) throw new Error("Conversation not found");
	const conversation = await Conversation.findById(conversationId);
	if (!conversation || !canAccess(user, conversation)) throw new Error("Conversation not found");
	return conversation;
}

// Wraps a handler so it always answers the client's ack with { ok, ...result } or { ok: false, error }
const withAck = (fn) => async (data, ack) => {
	const reply = typeof ack === "function" ? ack : () => {};
	try {
		reply({ ok: true, ...(await fn(data ?? {})) });
	} catch (err) {
		reply({ ok: false, error: err.message });
	}
};

export function registerSocketHandlers(io) {
	io.use(async (socket, next) => {
		try {
			const userId = verifySocketToken(socket.handshake.auth?.token);
			const user = userId && (await User.findById(userId));
			if (!user) return next(new Error("unauthorized"));
			socket.data.user = user;
			next();
		} catch (err) {
			next(err);
		}
	});

	io.on("connection", async (socket) => {
		const user = socket.data.user;
		const userId = user._id.toString();
		const sentAt = [];

		socket.join(userRoom(userId));
		const conversations = await Conversation.find(
			{ $or: [{ type: "channel" }, { type: "dm", members: user._id }] },
			"_id"
		);
		socket.join(conversations.map((c) => roomFor(c._id)));

		if (markOnline(userId)) socket.broadcast.emit("presence", { userId, online: true });
		socket.emit("ready");

		socket.on(
			"message:send",
			withAck(async ({ conversationId, text, parentId }) => {
				const now = Date.now();
				while (sentAt.length && now - sentAt[0] > RATE_WINDOW_MS) sentAt.shift();
				if (sentAt.length >= RATE_LIMIT) throw new Error("Slow down a little");
				sentAt.push(now);

				const conversation = await loadAccessible(user, conversationId);
				if (parentId && !isValidId(parentId)) throw new Error("Thread not found");
				const message = await postMessage({ conversation, sender: user, text, parentId });
				return { message: message.toPublic() };
			})
		);

		socket.on(
			"reaction:toggle",
			withAck(async ({ conversationId, messageId, emoji }) => {
				const conversation = await loadAccessible(user, conversationId);
				if (!isValidId(messageId)) throw new Error("Message not found");
				await toggleReaction({ user, messageId, emoji, conversation });
				return {};
			})
		);

		socket.on("typing", ({ conversationId, parentId, isTyping } = {}) => {
			if (!socket.rooms.has(roomFor(conversationId))) return;
			socket.to(roomFor(conversationId)).emit("typing", {
				conversationId,
				parentId: parentId || null,
				userId,
				isTyping: Boolean(isTyping),
			});
		});

		socket.on(
			"read",
			withAck(async ({ conversationId }) => {
				const conversation = await loadAccessible(user, conversationId);
				await markRead(user._id, conversation._id);
				return {};
			})
		);

		socket.on("disconnect", () => {
			if (markOffline(userId)) io.emit("presence", { userId, online: false });
		});
	});
}

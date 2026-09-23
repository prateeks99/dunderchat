import { Router } from "express";
import { Conversation } from "../mongoose/schemas/conversation.mjs";
import { Message } from "../mongoose/schemas/message.mjs";
import {
	bootstrapFor,
	createChannel,
	getOrCreateDm,
	toPublicConversation,
} from "../services/conversations.mjs";
import { canAccess, markRead } from "../services/messages.mjs";
import { handle, isValidId, requireAuth, requireMember } from "../utils/auth.mjs";

const router = Router();
const PAGE_SIZE = 50;

// Loads a conversation the signed-in user may read, or throws 404
async function loadConversation(request) {
	const { id } = request.params;
	const conversation = isValidId(id) ? await Conversation.findById(id) : null;
	if (!conversation || !canAccess(request.user, conversation)) {
		throw Object.assign(new Error("Conversation not found"), { status: 404 });
	}
	return conversation;
}

router.get(
	"/api/bootstrap",
	requireAuth,
	handle(async (request, response) => {
		response.json(await bootstrapFor(request.user));
	})
);

// Top-level messages, newest page first; pass ?before=<ISO date> for older pages
router.get(
	"/api/conversations/:id/messages",
	requireAuth,
	handle(async (request, response) => {
		const conversation = await loadConversation(request);
		const filter = { conversationId: conversation._id, parentId: null };
		const before = request.query.before ? new Date(request.query.before) : null;
		if (before && !isNaN(before)) filter.createdAt = { $lt: before };

		const page = await Message.find(filter).sort({ createdAt: -1 }).limit(PAGE_SIZE + 1);
		response.json({
			messages: page.slice(0, PAGE_SIZE).reverse().map((m) => m.toPublic()),
			hasMore: page.length > PAGE_SIZE,
		});
	})
);

router.get(
	"/api/messages/:id/thread",
	requireAuth,
	handle(async (request, response) => {
		const { id } = request.params;
		const parent = isValidId(id) ? await Message.findOne({ _id: id, parentId: null }) : null;
		const conversation = parent && (await Conversation.findById(parent.conversationId));
		if (!conversation || !canAccess(request.user, conversation)) {
			return response.status(404).json({ error: "Thread not found" });
		}
		const replies = await Message.find({ parentId: parent._id }).sort({ createdAt: 1 });
		response.json({ parent: parent.toPublic(), replies: replies.map((m) => m.toPublic()) });
	})
);

router.post(
	"/api/conversations",
	requireAuth,
	requireMember,
	handle(async (request, response) => {
		const channel = await createChannel({
			user: request.user,
			name: request.body?.name,
			topic: request.body?.topic,
		});
		response.status(201).json({ conversation: toPublicConversation(channel) });
	})
);

router.post(
	"/api/dms",
	requireAuth,
	handle(async (request, response) => {
		const { userId } = request.body ?? {};
		if (!isValidId(userId)) return response.status(400).json({ error: "Invalid user" });
		const dm = await getOrCreateDm(request.user, userId);
		response.json({ conversation: toPublicConversation(dm) });
	})
);

router.post(
	"/api/conversations/:id/read",
	requireAuth,
	handle(async (request, response) => {
		const conversation = await loadConversation(request);
		await markRead(request.user._id, conversation._id);
		response.json({ ok: true });
	})
);

export default router;

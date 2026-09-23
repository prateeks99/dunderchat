import { EventEmitter } from "node:events";
import { Message } from "../mongoose/schemas/message.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { ReadState } from "../mongoose/schemas/read-state.mjs";
import { getIo, roomFor } from "../realtime.mjs";

// Fired after every message from a human is saved; the bot engine listens to it
export const bus = new EventEmitter();

export const MAX_MESSAGE_LENGTH = 4000;

export const REACTION_EMOJIS = [
	"👍", "👎", "😂", "❤️", "🎉", "😮", "😢", "😡",
	"🔥", "👀", "🙏", "💯", "✅", "❌", "🤔", "😬",
	"🙄", "😐", "🥳", "📄", "🧻", "🌶️", "🥨", "🥬",
];

const MENTION_RE = /@([a-z0-9._-]+)/gi;

export const canAccess = (user, conversation) =>
	conversation.type === "channel" ||
	conversation.members.some((id) => id.toString() === user._id.toString());

export async function resolveMentions(text) {
	const names = [...new Set([...text.matchAll(MENTION_RE)].map((m) => m[1].toLowerCase()))];
	if (!names.length) return [];
	const users = await User.find({ username: { $in: names } }, "_id");
	return users.map((u) => u._id);
}

const threadMeta = (message) => ({
	_id: message._id.toString(),
	conversationId: message.conversationId.toString(),
	parentId: null,
	replyCount: message.replyCount,
	lastReplyAt: message.lastReplyAt,
	replyUserIds: message.replyUserIds.map(String),
});

export async function postMessage({ conversation, sender, text, parentId = null }) {
	const body = String(text ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
	if (!body) throw new Error("Message is empty");

	let parent = null;
	if (parentId) {
		parent = await Message.findOne({
			_id: parentId,
			conversationId: conversation._id,
			parentId: null,
		});
		if (!parent) throw new Error("Thread not found");
	}

	const message = await Message.create({
		conversationId: conversation._id,
		senderId: sender._id,
		text: body,
		mentions: await resolveMentions(body),
		parentId: parent?._id ?? null,
	});

	const io = getIo();
	io?.to(roomFor(conversation._id)).emit("message:new", message.toPublic());

	if (parent) {
		const updated = await Message.findByIdAndUpdate(
			parent._id,
			{
				$inc: { replyCount: 1 },
				$set: { lastReplyAt: message.createdAt },
				$addToSet: { replyUserIds: sender._id },
			},
			{ returnDocument: "after" }
		);
		io?.to(roomFor(conversation._id)).emit("message:update", threadMeta(updated));
	}

	// Sending a message means you've read the conversation up to it
	if (!sender.isBot) {
		await markRead(sender._id, conversation._id, message.createdAt);
		bus.emit("message", { message, conversation, sender });
	}
	return message;
}

export async function toggleReaction({ user, messageId, emoji, conversation }) {
	if (!REACTION_EMOJIS.includes(emoji)) throw new Error("Unsupported emoji");
	const message = await Message.findOne({ _id: messageId, conversationId: conversation._id });
	if (!message) throw new Error("Message not found");

	const userId = user._id.toString();
	const reaction = message.reactions.find((r) => r.emoji === emoji);
	if (!reaction) {
		message.reactions.push({ emoji, userIds: [user._id] });
	} else if (reaction.userIds.some((id) => id.toString() === userId)) {
		reaction.userIds = reaction.userIds.filter((id) => id.toString() !== userId);
		if (!reaction.userIds.length) {
			message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
		}
	} else {
		reaction.userIds.push(user._id);
	}
	await message.save();

	getIo()?.to(roomFor(conversation._id)).emit("message:update", {
		_id: message._id.toString(),
		conversationId: message.conversationId.toString(),
		parentId: message.parentId ? message.parentId.toString() : null,
		reactions: message.toPublic().reactions,
	});
	return message;
}

export async function markRead(userId, conversationId, at = new Date()) {
	await ReadState.updateOne(
		{ userId, conversationId },
		{ $max: { lastReadAt: at } },
		{ upsert: true }
	);
}

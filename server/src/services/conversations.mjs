import { Conversation, dmKeyFor } from "../mongoose/schemas/conversation.mjs";
import { Message } from "../mongoose/schemas/message.mjs";
import { ReadState } from "../mongoose/schemas/read-state.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { getIo, onlineUserIds, roomFor, userRoom } from "../realtime.mjs";

// Seeded channels appear in this order; user-created channels follow alphabetically
export const DEFAULT_CHANNEL_ORDER = [
	"general",
	"sales",
	"accounting",
	"party-planning",
	"warehouse",
	"random",
];

const CHANNEL_NAME_RE = /^[a-z0-9][a-z0-9-]{1,29}$/;

export const toPublicConversation = (conversation) => ({
	_id: conversation._id.toString(),
	type: conversation.type,
	name: conversation.name ?? null,
	topic: conversation.topic,
	isDefault: conversation.isDefault,
	members: conversation.members.map(String),
	createdAt: conversation.createdAt,
});

const channelSort = (a, b) => {
	const ai = DEFAULT_CHANNEL_ORDER.indexOf(a.name);
	const bi = DEFAULT_CHANNEL_ORDER.indexOf(b.name);
	if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
	return a.name.localeCompare(b.name);
};

export async function createChannel({ user, name, topic }) {
	const slug = String(name ?? "").trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
	if (!CHANNEL_NAME_RE.test(slug)) {
		throw Object.assign(
			new Error("Channel names use 2–30 lowercase letters, numbers or dashes"),
			{ status: 400 }
		);
	}
	if (await Conversation.exists({ type: "channel", name: slug })) {
		throw Object.assign(new Error("That channel already exists"), { status: 409 });
	}
	const channel = await Conversation.create({
		type: "channel",
		name: slug,
		topic: String(topic ?? "").trim().slice(0, 200),
		createdBy: user._id,
	});
	const io = getIo();
	io?.socketsJoin(roomFor(channel._id));
	io?.emit("conversation:new", toPublicConversation(channel));
	return channel;
}

export async function getOrCreateDm(user, otherUserId) {
	const other = await User.findById(otherUserId);
	if (!other) throw Object.assign(new Error("User not found"), { status: 404 });
	if (other._id.equals(user._id)) {
		throw Object.assign(new Error("You can't DM yourself"), { status: 400 });
	}

	const dmKey = dmKeyFor(user._id, other._id);
	let dm = await Conversation.findOne({ type: "dm", dmKey });
	if (dm) return dm;

	try {
		dm = await Conversation.create({ type: "dm", dmKey, members: [user._id, other._id] });
	} catch (err) {
		// Lost a race with the other participant creating the same DM
		if (err.code === 11000) return Conversation.findOne({ type: "dm", dmKey });
		throw err;
	}

	const io = getIo();
	for (const member of [user, other]) {
		io?.in(userRoom(member._id)).socketsJoin(roomFor(dm._id));
		io?.to(userRoom(member._id)).emit("conversation:new", toPublicConversation(dm));
	}
	return dm;
}

export async function conversationsFor(user) {
	const [channels, dms] = await Promise.all([
		Conversation.find({ type: "channel" }),
		Conversation.find({ type: "dm", members: user._id }),
	]);
	return [...channels.sort(channelSort), ...dms];
}

async function unreadFor(user, conversations) {
	const readStates = await ReadState.find({ userId: user._id });
	const lastRead = new Map(readStates.map((r) => [r.conversationId.toString(), r.lastReadAt]));

	return Promise.all(
		conversations.map(async (c) => {
			const since = lastRead.get(c._id.toString()) ?? user.createdAt;
			const base = { conversationId: c._id, createdAt: { $gt: since }, senderId: { $ne: user._id } };
			const [unreadCount, mentionCount] = await Promise.all([
				Message.countDocuments({ ...base, parentId: null }),
				c.type === "dm"
					? Message.countDocuments({ ...base, parentId: null })
					: Message.countDocuments({ ...base, mentions: user._id }),
			]);
			return { unreadCount, mentionCount };
		})
	);
}

export async function bootstrapFor(user) {
	const [users, conversations] = await Promise.all([User.find(), conversationsFor(user)]);
	const unread = await unreadFor(user, conversations);
	const botIds = users.filter((u) => u.isBot).map((u) => u._id.toString());

	return {
		me: user.toPublic(),
		users: users.map((u) => u.toPublic()),
		conversations: conversations.map((c, i) => ({ ...toPublicConversation(c), ...unread[i] })),
		online: [...new Set([...botIds, ...onlineUserIds()])],
	};
}

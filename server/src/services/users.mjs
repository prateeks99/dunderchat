import { config } from "../config.mjs";
import { Conversation } from "../mongoose/schemas/conversation.mjs";
import { Message } from "../mongoose/schemas/message.mjs";
import { ReadState } from "../mongoose/schemas/read-state.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { getIo } from "../realtime.mjs";
import { bus } from "./messages.mjs";

// Avatar colors handed out to humans (bots have their own signature colors)
const HUMAN_COLORS = [
	"#2E7D6B", "#7B4FA0", "#C05A2B", "#2F6FB0", "#A83F5F",
	"#5B7F2A", "#B8860B", "#3E5C76", "#8E5B3E", "#4A7C8C",
];

export const randomHumanColor = () =>
	HUMAN_COLORS[Math.floor(Math.random() * HUMAN_COLORS.length)];

// Tell connected clients about a new person and let the bots welcome them
export function announceNewUser(user) {
	getIo()?.emit("user:new", user.toPublic());
	bus.emit("user:joined", user);
}

export async function createGuest() {
	for (let attempt = 0; attempt < 5; attempt++) {
		const n = String(Math.floor(Math.random() * 9000) + 1000);
		try {
			const guest = await User.create({
				username: `temp${n}`,
				displayName: `Temp #${n}`,
				title: "Temp",
				color: randomHumanColor(),
				isGuest: true,
				expiresAt: new Date(Date.now() + config.guestTtlHours * 3600 * 1000),
			});
			announceNewUser(guest);
			return guest;
		} catch (err) {
			if (err.code !== 11000) throw err;
		}
	}
	throw new Error("Could not allocate a guest name");
}

// Removes expired guests along with everything they left behind
export async function sweepExpiredGuests() {
	const expired = await User.find({ isGuest: true, expiresAt: { $lte: new Date() } }, "_id");
	if (!expired.length) return 0;
	const ids = expired.map((u) => u._id);

	const dmIds = (await Conversation.find({ type: "dm", members: { $in: ids } }, "_id")).map(
		(c) => c._id
	);
	const guestMessages = await Message.find({ senderId: { $in: ids } }, "_id parentId");
	const guestTopLevelIds = guestMessages.filter((m) => !m.parentId).map((m) => m._id);
	const touchedThreads = [
		...new Set(guestMessages.filter((m) => m.parentId).map((m) => m.parentId.toString())),
	];

	await Message.deleteMany({
		$or: [
			{ senderId: { $in: ids } },
			{ parentId: { $in: guestTopLevelIds } },
			{ conversationId: { $in: dmIds } },
		],
	});

	// Drop the guests' reactions, then any reactions left with nobody on them
	await Message.updateMany(
		{ "reactions.userIds": { $in: ids } },
		{ $pull: { "reactions.$[].userIds": { $in: ids } } }
	);
	await Message.updateMany(
		{ "reactions.userIds": { $size: 0 } },
		{ $pull: { reactions: { userIds: { $size: 0 } } } }
	);

	// Recount threads the guests replied in
	for (const parentId of touchedThreads) {
		const replies = await Message.find({ parentId }, "senderId createdAt").sort({ createdAt: 1 });
		await Message.updateOne(
			{ _id: parentId },
			{
				replyCount: replies.length,
				lastReplyAt: replies.at(-1)?.createdAt ?? null,
				replyUserIds: [...new Set(replies.map((r) => r.senderId.toString()))],
			}
		);
	}

	await Conversation.deleteMany({ _id: { $in: dmIds } });
	await ReadState.deleteMany({
		$or: [{ userId: { $in: ids } }, { conversationId: { $in: dmIds } }],
	});
	await User.deleteMany({ _id: { $in: ids } });

	getIo()?.emit("users:removed", {
		userIds: ids.map(String),
		conversationIds: dmIds.map(String),
	});
	console.log(`Sweeper: removed ${ids.length} expired guest(s)`);
	return ids.length;
}

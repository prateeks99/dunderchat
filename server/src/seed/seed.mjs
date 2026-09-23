import { Conversation } from "../mongoose/schemas/conversation.mjs";
import { Message } from "../mongoose/schemas/message.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { personas } from "../bots/personas.mjs";
import { channels, history } from "./history.mjs";

const timestampFor = (daysAgo, at) => {
	const [hours, minutes] = at.split(":").map(Number);
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	date.setHours(hours, minutes, 0, 0);
	// "Today" entries later than now would sort after live messages, so clamp them
	return date > new Date() ? new Date(Date.now() - 60_000) : date;
};

async function seedBots() {
	const ids = new Map();
	for (const persona of personas) {
		const existing = await User.findOne({ username: persona.username });
		if (existing && !existing.isBot) {
			console.warn(`Seed: username "${persona.username}" belongs to a human; skipping bot`);
			continue;
		}
		const bot = await User.findOneAndUpdate(
			{ username: persona.username },
			{
				$set: {
					displayName: persona.displayName,
					title: persona.title,
					color: persona.color,
					isBot: true,
				},
				$setOnInsert: { createdAt: new Date(Date.now() - 30 * 86400000) },
			},
			{ upsert: true, returnDocument: "after" }
		);
		ids.set(persona.username, bot._id);
	}
	return ids;
}

async function seedChannelHistory(channel, botIds) {
	for (const block of history.filter((b) => b.channel === channel.name)) {
		for (const entry of block.messages) {
			const senderId = botIds.get(entry.from);
			if (!senderId) continue;
			const reactions = Object.entries(entry.reactions ?? {}).map(([emoji, users]) => ({
				emoji,
				userIds: users.map((u) => botIds.get(u)).filter(Boolean),
			}));
			const replies = (entry.thread ?? []).filter((r) => botIds.has(r.from));

			const parent = await Message.create({
				conversationId: channel._id,
				senderId,
				text: entry.text,
				mentions: [],
				reactions,
				createdAt: timestampFor(block.daysAgo, entry.at),
				replyCount: replies.length,
				lastReplyAt: replies.length
					? timestampFor(block.daysAgo, replies.at(-1).at)
					: undefined,
				replyUserIds: [...new Set(replies.map((r) => botIds.get(r.from).toString()))],
			});
			await Message.insertMany(
				replies.map((reply) => ({
					conversationId: channel._id,
					senderId: botIds.get(reply.from),
					text: reply.text,
					parentId: parent._id,
					createdAt: timestampFor(block.daysAgo, reply.at),
				}))
			);
		}
	}
}

// Idempotent: bots are upserted, and a channel's history is only written when the channel is first created
export async function seed() {
	const botIds = await seedBots();
	let created = 0;
	for (const { name, topic } of channels) {
		if (await Conversation.exists({ type: "channel", name })) continue;
		const channel = await Conversation.create({ type: "channel", name, topic, isDefault: true });
		await seedChannelHistory(channel, botIds);
		created++;
	}
	console.log(`Seed: ${botIds.size} bots ready, ${created} channel(s) created`);
}

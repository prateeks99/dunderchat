import { Conversation } from "../mongoose/schemas/conversation.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { getIo, humansOnlineCount, roomFor } from "../realtime.mjs";
import { bus, postMessage } from "../services/messages.mjs";
import { exchanges } from "./exchanges.mjs";
import { personas } from "./personas.mjs";

const MIN_GAP_MS = 3000; // global cap: one bot message every 3s
const MAX_QUEUE = 12;
const KEYWORD_CHANCE = 0.4;
const KEYWORD_COOLDOWN_MS = 2 * 60 * 1000;
const AMBIENT_MIN_MS = 3 * 60 * 1000;
const AMBIENT_MAX_MS = 6 * 60 * 1000;

const bots = new Map(); // username -> { user, persona }
const botsById = new Map(); // id -> { user, persona }
const cooldowns = new Map(); // `${username}:${conversationId}` -> timestamp
const bags = new Map(); // shuffle bags so lines don't repeat until a pool is used up

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomBetween = (min, max) => min + Math.random() * (max - min);
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

function shuffle(items) {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j], items[i]];
	}
	return items;
}

function pickLine(key, lines) {
	let bag = bags.get(key);
	if (!bag?.length) {
		bag = shuffle([...lines]);
		bags.set(key, bag);
	}
	return bag.pop();
}

const fill = (text, human) =>
	human
		? text
				.replaceAll("{name}", human.displayName || human.username)
				.replaceAll("{first}", (human.displayName || human.username).split(" ")[0])
		: text.replaceAll("{name}", "everyone").replaceAll("{first}", "friend");

// ---- Posting queue: every bot message goes through here so bots never flood a channel ----

const queue = [];
let draining = false;
let lastPostAt = 0;

function setTyping(bot, conversation, parentId, isTyping) {
	getIo()?.to(roomFor(conversation._id)).emit("typing", {
		conversationId: conversation._id.toString(),
		parentId: parentId ? parentId.toString() : null,
		userId: bot.user._id.toString(),
		isTyping,
	});
}

function enqueue(job) {
	if (queue.length >= MAX_QUEUE) return;
	queue.push(job);
	if (!draining) drain();
}

async function drain() {
	draining = true;
	while (queue.length) {
		const { bot, conversation, text, parentId = null, delayMs = 0, aboutUserId = null } = queue.shift();
		try {
			await sleep(Math.max(delayMs, lastPostAt + MIN_GAP_MS - Date.now(), 0));
			setTyping(bot, conversation, parentId, true);
			await sleep(Math.min(Math.max(1200 + text.length * 25, 1500), 4000));
			setTyping(bot, conversation, parentId, false);
			await postMessage({ conversation, sender: bot.user, text, parentId, aboutUserId });
			lastPostAt = Date.now();
		} catch (err) {
			console.error("Bots: failed to post", err.message);
		}
	}
	draining = false;
}

// ---- Reactions to humans ----

function onCooldown(bot, conversation) {
	const key = `${bot.persona.username}:${conversation._id}`;
	const last = cooldowns.get(key) || 0;
	if (Date.now() - last < KEYWORD_COOLDOWN_MS) return true;
	cooldowns.set(key, Date.now());
	return false;
}

function handleHumanMessage({ message, conversation, sender }) {
	// Replies stay in the thread the human wrote in
	const parentId = message.parentId ?? null;

	if (conversation.type === "dm") {
		const botId = conversation.members.map(String).find((id) => botsById.has(id));
		if (!botId) return;
		const bot = botsById.get(botId);
		// Stay on topic when the human mentions one of this bot's trigger words
		const trigger = bot.persona.keywords.find((k) => k.match.test(message.text));
		const text = trigger
			? pickLine(`${bot.persona.username}:kw:${trigger.match}`, trigger.lines)
			: pickLine(`${bot.persona.username}:dm:${sender._id}`, bot.persona.dm);
		enqueue({ bot, conversation, text: fill(text, sender), parentId, delayMs: 600, aboutUserId: sender._id });
		return;
	}

	const mentioned = message.mentions
		.map((id) => botsById.get(id.toString()))
		.filter(Boolean)
		.slice(0, 2);
	if (mentioned.length) {
		for (const bot of mentioned) {
			const line = fill(pickLine(`${bot.persona.username}:mention`, bot.persona.mention), sender);
			const text = parentId ? line : `@${sender.username} ${line}`;
			enqueue({ bot, conversation, text, parentId, delayMs: 600, aboutUserId: sender._id });
		}
		return;
	}

	for (const persona of shuffle([...personas])) {
		const trigger = persona.keywords.find((k) => k.match.test(message.text));
		if (!trigger) continue;
		if (Math.random() > (trigger.chance ?? KEYWORD_CHANCE)) continue;
		const bot = bots.get(persona.username);
		if (!bot || onCooldown(bot, conversation)) continue;
		const text = pickLine(`${persona.username}:kw:${trigger.match}`, trigger.lines);
		enqueue({ bot, conversation, text: fill(text, sender), parentId, delayMs: 800, aboutUserId: sender._id });
		return; // at most one keyword reply per message
	}
}

async function welcome(human) {
	if (human.isBot) return;
	const general = await Conversation.findOne({ type: "channel", name: "general" });
	const michael = bots.get("michael");
	const dwight = bots.get("dwight");
	if (!general || !michael) return;

	// Give the new hire's client a few seconds to load before the welcome lands
	enqueue({
		bot: michael,
		conversation: general,
		text: fill(pickLine("michael:welcome", michael.persona.welcome), human),
		delayMs: 4000,
		aboutUserId: human._id,
	});
	if (dwight) {
		enqueue({
			bot: dwight,
			conversation: general,
			text: fill(pickLine("dwight:welcome", dwight.persona.welcome), human),
			delayMs: 2500,
			aboutUserId: human._id,
		});
	}
}

// ---- Ambient chatter, only while at least one human is connected ----

async function ambientTick() {
	try {
		if (humansOnlineCount() === 0 || queue.length) return;
		const channels = await Conversation.find({ type: "channel", isDefault: true });
		if (!channels.length) return;

		if (Math.random() < 0.35) {
			const exchange = pickLine("exchanges", exchanges);
			const conversation = channels.find((c) => c.name === exchange.channel);
			if (!conversation) return;
			exchange.steps.forEach(([username, text], i) => {
				const bot = bots.get(username);
				if (bot) enqueue({ bot, conversation, text, delayMs: i === 0 ? 0 : 1200 });
			});
			return;
		}

		const bot = randomItem([...bots.values()]);
		const conversation = randomItem(channels);
		const text = pickLine(`${bot.persona.username}:ambient`, bot.persona.ambient);
		enqueue({ bot, conversation, text: fill(text, null) });
	} catch (err) {
		console.error("Bots: ambient tick failed", err.message);
	}
}

function scheduleAmbient() {
	setTimeout(async () => {
		await ambientTick();
		scheduleAmbient();
	}, randomBetween(AMBIENT_MIN_MS, AMBIENT_MAX_MS));
}

export async function startBots() {
	const users = await User.find({ isBot: true });
	for (const user of users) {
		const persona = personas.find((p) => p.username === user.username);
		if (!persona) continue;
		const bot = { user, persona };
		bots.set(persona.username, bot);
		botsById.set(user._id.toString(), bot);
	}

	bus.on("message", (event) => {
		if (!event.sender.isBot) handleHumanMessage(event);
	});
	bus.on("user:joined", (user) => {
		welcome(user).catch((err) => console.error("Bots: welcome failed", err.message));
	});
	scheduleAmbient();
	console.log(`Bots: ${bots.size} Scranton employees clocked in`);
}

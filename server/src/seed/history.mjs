// Seeded channels and a few days of backdated, original conversation so the workspace never looks empty.

export const channels = [
	{ name: "general", topic: "Company-wide announcements and work-based matters. Mostly Michael." },
	{ name: "sales", topic: "Leads, quotas, and who stole whose client. Dwight is keeping score." },
	{ name: "accounting", topic: "Numbers, receipts, and the vending machine budget." },
	{ name: "party-planning", topic: "Official Party Planning Committee business. Chair: Angela." },
	{ name: "warehouse", topic: "Shipping, receiving, and the baler (do not touch the baler)." },
	{ name: "random", topic: "Non-work banter. Keep it clean, Creed." },
];

// Each block is one day (daysAgo) in one channel. Times are local HH:MM.
export const history = [
	{
		channel: "general",
		daysAgo: 3,
		messages: [
			{
				at: "09:02",
				from: "michael",
				text: "Good morning Dunder Mifflin! Welcome to our new chat thing. It's like email but faster and nobody can pretend they didn't see it.",
				reactions: { "🎉": ["jim", "pam", "andy"], "🙄": ["stanley"] },
			},
			{ at: "09:04", from: "dwight", text: "I have already read the entire terms of service. Twice. Ask me anything." },
			{ at: "09:05", from: "jim", text: "Dwight, what's the maximum number of messages you can send before they ban you?" },
			{
				at: "09:05",
				from: "dwight",
				text: "There is no limit. I checked.",
				reactions: { "😂": ["jim", "pam", "oscar"] },
			},
			{ at: "09:30", from: "pam", text: "Reminder: please update your profile titles. Michael, 'Supreme Leader' is not approved." },
			{ at: "09:31", from: "michael", text: "It's aspirational, Pam." },
		],
	},
	{
		channel: "general",
		daysAgo: 1,
		messages: [
			{
				at: "10:15",
				from: "michael",
				text: "BIG announcement at 3pm in the conference room. Attendance is not mandatory. It is extremely mandatory.",
				reactions: { "👀": ["jim", "pam", "kevin"], "😐": ["stanley", "angela"] },
				thread: [
					{ at: "10:17", from: "oscar", text: "Is this about the budget? Please tell me it's about the budget." },
					{ at: "10:18", from: "michael", text: "It's about something much more important than the budget." },
					{ at: "10:18", from: "jim", text: "Is it a magic trick." },
					{ at: "10:19", from: "michael", text: "…it is a small part magic trick." },
				],
			},
			{ at: "15:42", from: "kevin", text: "that was a good meeting. there were donuts" },
			{
				at: "15:44",
				from: "toby",
				text: "Just a reminder that the fire exit should not be blocked with a magic trick setup.",
				reactions: { "👎": ["michael"] },
			},
		],
	},
	{
		channel: "sales",
		daysAgo: 2,
		messages: [
			{
				at: "08:58",
				from: "dwight",
				text: "Leaderboard, week to date:\n1. Dwight Schrute\n2. Also Dwight Schrute (projected)\n3. Everyone else",
				reactions: { "🙄": ["jim", "phyllis", "stanley"] },
			},
			{ at: "09:12", from: "jim", text: "Just closed the Lackawanna County account. 🎉" },
			{
				at: "09:13",
				from: "dwight",
				text: "That was my lead.",
				thread: [
					{ at: "09:14", from: "jim", text: "It was on the lead board, Dwight. Under 'open'." },
					{ at: "09:14", from: "dwight", text: "The lead board is a suggestion." },
					{ at: "09:16", from: "phyllis", text: "Congratulations Jim, dear." },
				],
			},
			{ at: "11:40", from: "andy", text: "Nard Dog has three calls scheduled today. Three! Watch this space. 🐶" },
			{ at: "16:55", from: "stanley", text: "It is 4:55." },
		],
	},
	{
		channel: "sales",
		daysAgo: 0,
		messages: [
			{ at: "08:45", from: "phyllis", text: "Morning everyone. Bob says hi." },
			{ at: "08:46", from: "andy", text: "Hi Bob! 👋" },
		],
	},
	{
		channel: "accounting",
		daysAgo: 2,
		messages: [
			{ at: "10:02", from: "angela", text: "Whoever filed receipts in crayon, this is your final warning." },
			{
				at: "10:03",
				from: "kevin",
				text: "it was a marker",
				reactions: { "😬": ["oscar"] },
			},
			{
				at: "13:20",
				from: "oscar",
				text: "I've finished the quarterly reconciliation. We are, surprisingly, fine.",
				reactions: { "🎉": ["kevin"], "✅": ["angela"] },
				thread: [
					{ at: "13:22", from: "kevin", text: "does fine mean we get a pizza party" },
					{ at: "13:23", from: "oscar", text: "Fine means fine, Kevin." },
					{ at: "13:23", from: "angela", text: "There will be no pizza party." },
				],
			},
		],
	},
	{
		channel: "party-planning",
		daysAgo: 1,
		messages: [
			{ at: "14:00", from: "angela", text: "Agenda for Meredith's birthday: 1. Cake. 2. Eating the cake. 3. Returning to work." },
			{ at: "14:02", from: "pam", text: "Could we do a banner? I could paint something." },
			{ at: "14:02", from: "angela", text: "A small banner. Muted colors." },
			{
				at: "14:05",
				from: "phyllis",
				text: "I'll bring my lemon squares!",
				reactions: { "❤️": ["pam", "kevin"] },
			},
			{ at: "14:06", from: "michael", text: "I want the cake to say 'Congratulations Meredith' AND 'Happy Birthday'. Two messages. One cake." },
		],
	},
	{
		channel: "warehouse",
		daysAgo: 2,
		messages: [
			{ at: "07:30", from: "dwight", text: "Inventory count this morning. 412 cases of copy paper, 38 of cardstock, 1 suspicious box labeled 'CREED'." },
			{
				at: "07:41",
				from: "creed",
				text: "That box is not mine. Do not open it.",
				reactions: { "👀": ["dwight", "jim"] },
			},
			{ at: "12:15", from: "michael", text: "Shoutout to the warehouse for keeping this company running! 📦 You are the backbone. We are the brain." },
		],
	},
	{
		channel: "random",
		daysAgo: 3,
		messages: [
			{
				at: "12:30",
				from: "kevin",
				text: "I'm making my famous chili this weekend. Who wants some Monday",
				reactions: { "🌶️": ["jim", "pam", "michael", "andy"] },
			},
			{ at: "12:34", from: "creed", text: "I'll take two bowls. I'll pay you in exposure." },
		],
	},
	{
		channel: "random",
		daysAgo: 1,
		messages: [
			{
				at: "16:10",
				from: "pam",
				text: "Finished a watercolor of the building from the parking lot. It's not much but I like it. 🎨",
				reactions: { "❤️": ["jim", "phyllis", "oscar", "michael"], "🔥": ["andy"] },
				thread: [
					{ at: "16:12", from: "jim", text: "It's great, Pam. Put it in the lobby." },
					{ at: "16:14", from: "michael", text: "I am buying this. What's the price. I will pay double. Name a number." },
					{ at: "16:15", from: "pam", text: "It's not for sale, Michael. But thank you." },
				],
			},
			{ at: "17:02", from: "stanley", text: "Goodnight." },
		],
	},
];

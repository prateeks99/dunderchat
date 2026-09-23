// The Scranton branch. Every line here is original, in-character writing.
// Placeholders: {name} = the human's display name, {first} = its first word.

export const personas = [
	{
		username: "michael",
		displayName: "Michael Scott",
		title: "Regional Manager",
		color: "#1F5FA8",
		keywords: [
			{
				match: /\b(so hard|too hard|so big|really big|long and hard|pull it out|get it in)\b/i,
				chance: 0.8,
				lines: ["That's what she said! 😎", "That's what she said.", "…that's what she said. Sorry. Continue."],
			},
			{
				match: /\btoby\b/i,
				lines: [
					"Why are we talking about Toby. Nobody asked about Toby. Let's never ask about Toby.",
					"If Toby is in this thread I am leaving this thread.",
					"Toby is the silent killer of fun. Like carbon monoxide, but in a cardigan.",
				],
			},
			{
				match: /\b(meeting|conference room)\b/i,
				lines: [
					"Conference room. Five minutes. Bring snacks, or ideas, or snack ideas.",
					"Did someone say meeting? I have a whiteboard and I am not afraid to use it.",
				],
			},
			{
				match: /\b(boss|manager)\b/i,
				lines: [
					"I prefer 'friend who signs your paycheck'. But boss is fine. World's Best Boss is better.",
				],
			},
		],
		mention: [
			"You rang? And by rang I mean @'d. And by @'d I mean you need my leadership.",
			"Great question. I'll answer it at the next all-hands, which is now. Everyone, conference room.",
			"I hear you, {first}. I'm not going to do anything about it, but I hear you.",
			"This is why I have an open door policy. The door is open. Emotionally.",
			"Love that energy. Put it in writing. Then give it to Pam.",
			"Okay, I am putting a pin in that. A gold pin. You're getting a Dundie.",
			"Is this a work thing or a friend thing? Because I am great at both, just one at a time.",
		],
		dm: [
			"Hey buddy! So glad you slid into my DMs. Is that what the kids say? Pam says no.",
			"My door is always open. This chat is basically my door.",
			"I'll be honest with you, because we're friends now: I don't know. But I believe in us.",
			"Can this wait until after lunch? I'm at a very important lunch. It's Chili's.",
			"Absolutely. Consider it done. Consider it somewhat done. Consider it discussed.",
		],
		ambient: [
			"Reminder: morale is mandatory.",
			"Who wants to be in a movie? No reason. Asking for a movie I'm making.",
			"I just want everyone to know that I am proud of you. Especially the ones I like.",
			"Paper is not just a product. It's a feeling. The feeling is 'paper'.",
			"Is it too early for a birthday party? Whose birthday is it? Let's find someone.",
			"Business idea: paper, but it's for your feelings. Journals. I've invented journals.",
		],
		welcome: [
			"EVERYONE. Stop what you're doing. We have a new hire: {name}! Welcome to the family. It's like a real family, but with a dental plan.",
			"Attention Dunder Mifflin: please welcome {name}! I have a good feeling about you. I also had a good feeling about Ryan, so, results may vary.",
			"New face alert! {name}, welcome to the best branch in the whole company. Don't check the numbers, just trust me.",
		],
	},
	{
		username: "dwight",
		displayName: "Dwight Schrute",
		title: "Assistant to the Regional Manager",
		color: "#C9A227",
		keywords: [
			{
				match: /\bbeets?\b/i,
				lines: [
					"Beets are nature's candy. Also nature's fuel. Also nature's currency, on my farm.",
					"Did someone mention beets? Schrute Farms has a surplus. Cash only.",
					"Beets: high in fiber, higher in dignity.",
				],
			},
			{
				match: /\b(bear|bears)\b/i,
				lines: [
					"Correct response to a bear depends on the bear. I have a laminated chart. Ask me for it.",
				],
			},
			{
				match: /\b(security|safety|fire drill)\b/i,
				lines: [
					"As volunteer sheriff's deputy, I will be handling security. Everyone remain calm. Especially Kevin.",
					"Safety is not a joke. Unless you're Jim, in which case everything is a joke and that is the problem.",
				],
			},
			{
				match: /\bassistant regional manager\b/i,
				lines: ["Assistant TO the Regional Manager. Get it right or get out of the channel."],
			},
		],
		mention: [
			"Question noted. Answer: yes. Follow-up question: why were you not already doing that?",
			"I have been summoned. State your business.",
			"Incorrect. But I respect that you tried.",
			"I will handle it. I handle everything. That is my job and also my nature.",
			"Before I answer: are you working for Jim? Blink twice if you are working for Jim.",
			"Fact: I have already thought about this more than you have.",
			"Noted and logged. My logs are extensive and fully admissible.",
		],
		dm: [
			"Why are you messaging me privately. What do you know.",
			"This conversation is being recorded for training purposes. My training.",
			"I will consider your request after my 3pm karate session.",
			"Speak freely. Within reason. Within my reason.",
			"If this is about the stapler in the Jell-O, I was not involved. Yet.",
		],
		ambient: [
			"Reminder that I have the highest sales numbers this quarter. Again. Not bragging, reporting.",
			"Whoever took my pen: I know. Return it and there will be no consequences. There will be consequences.",
			"Schrute Farms now offers overnight stays. Beds are firm. The beet tasting is mandatory.",
			"Today's motivational fact: a shark never stops swimming. Be the shark. Sell the paper.",
			"If anyone needs me I will be in the parking lot inspecting tire pressure. For safety.",
			"Emergency preparedness update: I have moved the emergency kit. You don't need to know where.",
		],
		welcome: [
			"New hire {name}: your probationary period begins now. I will be observing. Closely.",
			"Welcome, {first}. Please submit your emergency contact, blood type, and your stance on bears.",
			"{name}. Interesting. I'll be running a background check. Standard procedure. My procedure.",
		],
	},
	{
		username: "jim",
		displayName: "Jim Halpert",
		title: "Sales Representative",
		color: "#4C8BD9",
		keywords: [
			{
				match: /\b(prank|stapler|jell-?o)\b/i,
				lines: [
					"I have no idea what you're talking about. 👀",
					"Allegedly.",
					"I would never. I would absolutely never. Except on Tuesdays.",
				],
			},
			{
				match: /\bdwight\b/i,
				lines: [
					"Fun fact: Dwight's desk is now three inches to the left. He hasn't noticed. Yet.",
					"Whatever Dwight told you, it's about 40% accurate.",
				],
			},
		],
		mention: [
			"Hey! What's up?",
			"Honestly? Good call. I'm in.",
			"Ha. Yeah. I'll look into it after I finish looking busy.",
			"I'm going to pretend I didn't see this so I can be surprised later.",
			"Can confirm. Also can confirm Dwight will have opinions.",
			"Sure thing, {first}. Give me like five minutes. Maybe ten. Definitely before lunch.",
		],
		dm: [
			"Hey {first}! Welcome to the most exciting paper company in Scranton. Top three, easily.",
			"Pro tip: never take the last coffee. Dwight measures it.",
			"Want to help with something? It involves Dwight and a lot of packing peanuts.",
			"Honestly the secret to this job is looking at the camera. You'll see.",
			"Good question. Nobody here knows. We just sort of go with it.",
		],
		ambient: [
			"Is it Friday yet? Checking for a friend.",
			"Sold a whole pallet of cardstock today. Nobody clap. Okay, one person clap.",
			"Anyone want to grab lunch? Not Dwight. Sorry Dwight.",
			"Has anyone seen my stapler? Asking because I need to know where not to look.",
			"Dwight just asked me if I'd ever consider a career in beet sales. Considering it.",
		],
	},
	{
		username: "pam",
		displayName: "Pam Beesly",
		title: "Receptionist",
		color: "#D9738C",
		keywords: [
			{
				match: /\b(art|draw|drawing|paint|painting)\b/i,
				lines: [
					"Oh, I love that! I've been doing watercolors of the office building. It's… a building. But it's mine.",
					"If anyone wants a doodle for their desk, my sketchbook is open.",
				],
			},
			{
				match: /\b(fax|phone|reception|call)\b/i,
				lines: [
					"Dunder Mifflin, this is Pam! Sorry, reflex.",
					"The fax machine is working today. Don't say it out loud, it can hear you.",
				],
			},
		],
		mention: [
			"Hi! What do you need?",
			"I can help with that. Give me a sec, the phone is ringing. The phone is always ringing.",
			"That's really sweet, thank you. 😊",
			"Oh no. Okay. I'll handle it before Michael finds out.",
			"Sure! I'll put it on the whiteboard. Next to the drawing of Dwight Jim did. That I did not do.",
			"Totally. Want me to order lunch for that too?",
		],
		dm: [
			"Hi {first}! Welcome! If you need supplies, the closet is to the left. Ignore the sign Dwight put up.",
			"If Michael asks, the meeting got moved. I'm not sure where. Probably nowhere.",
			"You're doing great. Everyone's a little lost the first week. And the second.",
			"Thanks for reaching out! Reception is the heart of the office. Or at least the lobby.",
			"Ha, yes. Welcome to my every day.",
		],
		ambient: [
			"Reminder: the kitchen fridge gets cleaned out Friday. Kevin, that means the tupperware.",
			"Messages for Michael are on his desk. All eleven of them. From the same guy.",
			"New art in the break room! Please don't hang coats on it.",
			"Whoever keeps setting the copier to 500 copies: I see you.",
		],
	},
	{
		username: "ryan",
		displayName: "Ryan Howard",
		title: "Senior Temp",
		color: "#3A3A3A",
		keywords: [
			{
				match: /\b(startup|app|disrupt|synergy|pivot|crypto)\b/i,
				lines: [
					"This is exactly what I've been saying. Paper is a legacy platform. We need to disrupt it.",
					"I have a pitch deck for this. It's 70 slides. Slide one is just the word 'Vision'.",
				],
			},
		],
		mention: [
			"Yeah, I saw. I'm just really busy with my business school stuff.",
			"Can we take this offline? Like, fully offline. Forever.",
			"Interesting. I'm going to need you to circle back on that.",
			"Honestly I'm kind of above this but sure.",
			"I'll add it to my roadmap. It's a very long roadmap.",
		],
		dm: [
			"Hey. What's up. I'm kind of in the middle of a thing.",
			"Have you heard of my website? It's like a social network but for business. Not LinkedIn.",
			"Cool. Let's sync later. Or never. Whatever works.",
		],
		ambient: [
			"Working on a new venture. Can't say much. It's basically Uber but for paper.",
			"Just updated my LinkedIn headline to 'Visionary'.",
			"Thinking about moving to New York. Again.",
		],
	},
	{
		username: "andy",
		displayName: "Andy Bernard",
		title: "Regional Director in Charge of Sales",
		color: "#B23A48",
		keywords: [
			{
				match: /\b(cornell|college|ivy)\b/i,
				lines: [
					"Did someone say Cornell? Because I went there. Big Red, baby! 🔴",
					"Fun fact, I went to Cornell. You may have heard. From me. Several times.",
				],
			},
			{
				match: /\b(sing|song|music|a cappella|banjo)\b/i,
				lines: [
					"🎶 Doo-doo-doo, a cappella for the whole office! 🎶 Anyone want to form a quartet?",
					"I'll bring the banjo. You bring the harmony. Nobody bring Dwight.",
				],
			},
		],
		mention: [
			"Andy Bernard, reporting for duty! What can the Nard Dog do for you?",
			"Ooh, love it. Love, love, love it. Tell me more over a round of Big Red soda.",
			"You know who'd crush that? This guy. 👉👈 Wait, other way.",
			"Consider it handled, amigo.",
			"Great hustle, {first}. You're going places. Possibly Ithaca.",
		],
		dm: [
			"Hey hey! {first}! Did I mention I went to Cornell? Just making sure.",
			"I'm putting together a fantasy paper league. You in?",
			"Don't tell anyone, but my ringtone is me singing. Very professional.",
		],
		ambient: [
			"Big sale today, team! 🎉 The Nard Dog is on fire.",
			"Anyone want to hear a song I wrote about toner? It's called 'Toner Love'.",
			"Pro tip: everything's better with a little a cappella. Especially quarterly reviews.",
		],
	},
	{
		username: "angela",
		displayName: "Angela Martin",
		title: "Senior Accountant",
		color: "#8E6BB8",
		keywords: [
			{
				match: /\b(cat|cats|kitten)\b/i,
				lines: [
					"Cats are the only coworkers who have never disappointed me.",
					"If you're talking about cats, be respectful. Sprinkles is watching from heaven.",
				],
			},
			{
				match: /\b(party|parties|cake|birthday)\b/i,
				lines: [
					"All party requests go through the Party Planning Committee. The chair is me. The answer is no.",
					"There will be a party. It will be tasteful. There will be no streamers.",
				],
			},
		],
		mention: [
			"What.",
			"I'll look at it when I look at it.",
			"This is not the appropriate channel for this. Or any channel.",
			"Fine. But I'm not happy about it.",
			"Submit it in writing. Legibly. Not in pencil.",
			"No. Next question.",
		],
		dm: [
			"Why are you messaging me directly? There's a process.",
			"I'm very busy. Say what you need in one sentence.",
			"If this is about the party budget, the answer is still no.",
		],
		ambient: [
			"Reminder: expense reports are due Friday. Receipts must be attached. Not described. Attached.",
			"Someone used my good pen. I have a list of suspects. Everyone is on it.",
			"Party Planning Committee meets at 3. Committee members only. You know who you are.",
		],
	},
	{
		username: "oscar",
		displayName: "Oscar Martinez",
		title: "Accountant",
		color: "#2E8B57",
		keywords: [
			{
				match: /\b(actually|technically|budget|numbers|surplus)\b/i,
				lines: [
					"Actually, that's a common misconception. Happy to walk you through it.",
					"If we're talking numbers, I'd love for someone to look at them before deciding things. Just once.",
				],
			},
			{
				match: /\b(wine|book|museum|opera)\b/i,
				lines: ["Finally, some culture in this chat. Thank you."],
			},
		],
		mention: [
			"Happy to help. Let me explain it simply. Actually, let me explain it correctly.",
			"That's reasonable. Which, frankly, is refreshing around here.",
			"I'll check the math. Someone has to.",
			"Short answer: no. Long answer: also no, but with a spreadsheet.",
			"Good question, {first}. Most people here don't ask questions. They just do things.",
		],
		dm: [
			"Hi {first}. Welcome. You seem sensible. Please stay that way.",
			"If you need anything explained, I'm your guy. I have a chart for most things.",
			"Word of advice: never let Michael near the budget.",
		],
		ambient: [
			"Friendly reminder that the numbers are not 'vibes'. They are numbers.",
			"Just finished a very good book. Nobody here will want to discuss it. That's fine.",
			"Accounting is quiet today. Too quiet. Kevin, what did you do.",
		],
	},
	{
		username: "kevin",
		displayName: "Kevin Malone",
		title: "Accountant",
		color: "#D2691E",
		keywords: [
			{
				match: /\bchili\b/i,
				lines: [
					"Chili is my specialty. The secret is you undercook the onions. Everybody overcooks the onions.",
					"Did someone say chili? I'll bring the big pot. Please don't bump into me.",
				],
			},
			{
				match: /\b(food|lunch|snack|snacks|pizza|m&ms|candy|cookies)\b/i,
				lines: [
					"Food? Where. I'm coming.",
					"If there's snacks, save me some. All of them.",
					"I've been thinking about lunch since breakfast.",
				],
			},
		],
		mention: [
			"Yeah.",
			"Oh. Okay. Cool.",
			"I don't know. Is it lunch time?",
			"Nice. 👍",
			"Sounds good. I'm going to go think about it near the vending machine.",
			"Me? I'm doing great. Accounting is going. It's going.",
		],
		dm: [
			"Hi.",
			"Do you have snacks.",
			"I'm in a band. Scrantonicity 2. We do weddings.",
			"Oscar says I'm not supposed to do math without him. So I'm not.",
		],
		ambient: [
			"Anybody want the rest of this cake. Nevermind I ate it.",
			"The vending machine ate my dollar. Now we're even.",
			"Today is a good day. I found a quarter.",
			"Big lunch plans. Huge.",
		],
	},
	{
		username: "stanley",
		displayName: "Stanley Hudson",
		title: "Sales Representative",
		color: "#6B4E2E",
		keywords: [
			{
				match: /\bpretzels?\b/i,
				lines: [
					"Pretzel day is the only day I come in with a smile.",
					"If someone is bringing pretzels, I will be there. For the pretzels.",
				],
			},
			{
				match: /\b(crossword|retire|retirement|florida)\b/i,
				lines: [
					"Retirement is a state of mind. And a state. Florida.",
					"I'm doing my crossword. That is what I'm doing.",
				],
			},
		],
		mention: [
			"Did I stutter?",
			"No.",
			"I'm doing my crossword.",
			"I am not going to engage with this.",
			"Ask someone who cares. So, not me.",
		],
		dm: [
			"What.",
			"I'm on break. Since 9am.",
			"If this is a meeting request, the answer is no.",
		],
		ambient: [
			"Countdown to 5pm has begun.",
			"Another day, another day.",
		],
	},
	{
		username: "phyllis",
		displayName: "Phyllis Vance",
		title: "Sales Representative",
		color: "#7FA650",
		keywords: [
			{
				match: /\b(knit|knitting|sweater|scarf)\b/i,
				lines: [
					"I'm knitting scarves for the whole office this year! Angela, I'm doing yours in beige.",
					"Oh, I love a good knit. Bob Vance says I'm the best knitter in Scranton.",
				],
			},
			{
				match: /\b(fridge|refrigerator|bob vance)\b/i,
				lines: [
					"Bob Vance, Vance Refrigeration, is my husband. He says hello.",
					"If you need a fridge, I know a guy. I married him.",
				],
			},
		],
		mention: [
			"Oh, hello dear! What can I do for you?",
			"That's so nice. I'll tell Bob.",
			"Mmhm. I'll take care of it.",
			"You're sweet. Now go help Pam, she looks tired.",
		],
		dm: [
			"Hi sweetie! Welcome aboard. Don't let Angela scare you.",
			"If you need a ride, Bob can pick you up. He has a van. It's very nice.",
			"I have extra yarn if you ever want to learn to knit!",
		],
		ambient: [
			"Bob and I are going to the lake this weekend. Just lovely.",
			"Brought muffins! They're by the copier. Kevin, save one for someone else.",
		],
	},
	{
		username: "creed",
		displayName: "Creed Bratton",
		title: "Quality Assurance",
		color: "#5F6B73",
		keywords: [
			{
				match: /\b(quality|qa|assurance)\b/i,
				lines: [
					"Quality assurance. I assure you, there is quality. Somewhere.",
					"I've been doing QA for years. Don't ask me what the Q stands for.",
				],
			},
			{
				match: /\b(mung beans?|sprouts?)\b/i,
				lines: ["I grow those in my desk drawer. Don't open my desk drawer."],
			},
		],
		mention: [
			"Who's asking? And what's in it for me?",
			"I've seen things. I'll tell you about them for five bucks.",
			"Sure, sure. I don't know who you are, but sure.",
			"That reminds me of my time in the sixties. Or the forties. One of the numbers.",
			"If anyone asks, I was here all day.",
		],
		dm: [
			"You look like someone I owe money to. Do I owe you money? Don't answer that.",
			"Are you a cop? You have to tell me if you're a cop.",
			"Don't tell anyone, but I'm not sure I work here.",
			"I have a blog. It's on a website. Look it up. Don't look it up.",
		],
		ambient: [
			"Does anyone know what we sell here? Asking for my performance review.",
			"Found a wallet in the parking lot. It's mine now. That's the rules.",
			"I've been awake for 3 days. Or asleep. Hard to say.",
			"If anyone needs a fake ID, I'm not saying I can help. But I'm not not saying it.",
		],
	},
	{
		username: "toby",
		displayName: "Toby Flenderson",
		title: "Human Resources",
		color: "#9AA5AE",
		keywords: [
			{
				match: /\b(hr|policy|complaint|harassment|conduct)\b/i,
				lines: [
					"Just a gentle reminder that HR is here for everyone. Even when nobody wants us to be.",
					"I'll need that in writing. For the file. The file is very full.",
				],
			},
			{
				match: /\bcosta rica\b/i,
				lines: ["Costa Rica… wow. That's the dream."],
			},
		],
		mention: [
			"Oh. Hi. Someone actually tagged me. Thanks.",
			"I'm happy to help. Honestly, it's nice to be asked.",
			"Sure. I'll need to fill out a form, but sure.",
			"Just letting you know, Michael will probably be upset that I responded.",
		],
		dm: [
			"Hi {first}. My door's always open. Nobody ever comes in, but it's open.",
			"If you ever need to talk, I'm in the annex. Near the fax machine that doesn't work.",
		],
		ambient: [
			"Reminder: the new sensitivity training is mandatory. I'll bring cookies. Nobody will come.",
			"Please remember to fill out your timesheets. Accurately. Creed.",
		],
	},
];

export const personaByUsername = new Map(personas.map((p) => [p.username, p]));

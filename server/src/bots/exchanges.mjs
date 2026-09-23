// Short scripted back-and-forths the ambient scheduler can play in a channel.
// Each step is [username, text]; steps are posted a few seconds apart with typing indicators.

export const exchanges = [
	{
		channel: "sales",
		steps: [
			["dwight", "Jim. Why is my phone in a block of Jell-O."],
			["jim", "Huh. That's weird. Did you check the fridge for your keyboard?"],
			["dwight", "WHY WOULD MY KEYBOARD BE IN THE FRIDGE."],
			["jim", "No reason."],
		],
	},
	{
		channel: "accounting",
		steps: [
			["oscar", "The quarterly totals are off by $3.20."],
			["angela", "Kevin."],
			["kevin", "It was a vending machine emergency."],
			["oscar", "There's no such thing as a vending machine emergency."],
			["kevin", "There is if you're hungry."],
		],
	},
	{
		channel: "general",
		steps: [
			["michael", "Quick poll: who here would take a bullet for me? Hypothetically."],
			["dwight", "Me. Without hesitation. I would take several."],
			["stanley", "I'd need more details about the bullet."],
			["michael", "Great, so that's one yes and one maybe. Love this team."],
		],
	},
	{
		channel: "party-planning",
		steps: [
			["angela", "The theme for Friday's party is 'Muted Elegance'. Beige only."],
			["phyllis", "Could we maybe add one color? Just a little one?"],
			["angela", "Absolutely not."],
			["pam", "I'll bring a beige cake. It'll be… festive beige."],
		],
	},
	{
		channel: "random",
		steps: [
			["creed", "Has anyone seen my wallet? The one with somebody else's name on it?"],
			["pam", "Creed, that's Toby's wallet. He's been looking for it."],
			["creed", "Finders keepers, Pam. It's in the handbook."],
			["toby", "It's not in the handbook. I wrote the handbook."],
		],
	},
	{
		channel: "sales",
		steps: [
			["andy", "Nard Dog just closed the Hammermill account! 🎉🎉"],
			["dwight", "Hammermill is a competitor, Andy. You can't close their account."],
			["andy", "…I closed it emotionally."],
			["jim", "Honestly that counts."],
		],
	},
	{
		channel: "warehouse",
		steps: [
			["michael", "Warehouse crew! Just checking in. How are my blue-collar heroes?"],
			["kevin", "Michael, it's just me down here. I came for the vending machine."],
			["michael", "Kevin, you are a hero too. A hungry hero."],
		],
	},
	{
		channel: "general",
		steps: [
			["ryan", "I'm pivoting the branch to a paperless workflow."],
			["oscar", "We sell paper, Ryan."],
			["ryan", "Which is why it's disruptive."],
			["stanley", "I'm going to lunch."],
		],
	},
];

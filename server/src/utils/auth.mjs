import mongoose from "mongoose";

export const requireAuth = (request, response, next) =>
	request.user ? next() : response.status(401).json({ error: "Not signed in" });

export const requireMember = (request, response, next) =>
	request.user?.isGuest
		? response.status(403).json({ error: "Temps can't do that. Sign up for a real account." })
		: next();

export const isValidId = (id) => mongoose.isValidObjectId(id);

// Wraps async route handlers so thrown errors (with an optional .status) become JSON responses
export const handle = (fn) => async (request, response, next) => {
	try {
		await fn(request, response, next);
	} catch (err) {
		if (!err.status) console.error(err);
		response.status(err.status || 500).json({ error: err.status ? err.message : "Internal Server Error" });
	}
};

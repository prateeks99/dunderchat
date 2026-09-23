// Holds the Socket.IO server and in-memory presence so services can emit without import cycles.
let io = null;

export const setIo = (server) => {
	io = server;
};

export const getIo = () => io;

export const roomFor = (conversationId) => `conv:${conversationId}`;
export const userRoom = (userId) => `user:${userId}`;

// userId -> number of connected sockets (a user can have several tabs open)
const online = new Map();

// Returns true when the user just came online
export const markOnline = (userId) => {
	const count = online.get(userId) || 0;
	online.set(userId, count + 1);
	return count === 0;
};

// Returns true when the user's last socket disconnected
export const markOffline = (userId) => {
	const count = (online.get(userId) || 1) - 1;
	if (count <= 0) {
		online.delete(userId);
		return true;
	}
	online.set(userId, count);
	return false;
};

export const onlineUserIds = () => [...online.keys()];
export const humansOnlineCount = () => online.size;

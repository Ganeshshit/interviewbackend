const io = require('socket.io');
const config = require('../config/signalingConfig');

let rooms = new Map();

class Room {
    constructor(roomId, interviewer) {
        this.roomId = roomId;
        this.interviewer = interviewer;
        this.candidate = null;
        this.createdAt = new Date();
        this.lastActivity = new Date();
    }
}

const setupSocket = (server) => {
    const socketServer = io(server, {
        cors: config.CORS_OPTIONS,
        pingTimeout: config.PING_TIMEOUT,
        pingInterval: config.PING_INTERVAL
    });

    socketServer.on(config.SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log('User connected:', socket.id);

        // Create room
        socket.on(config.SOCKET_EVENTS.CREATE_ROOM, (roomId, callback) => {
            try {
                if (rooms.has(roomId)) {
                    throw new Error('Room already exists');
                }

                const room = new Room(roomId, socket.id);
                rooms.set(roomId, room);
                socket.join(roomId);

                callback?.({ success: true, roomId });
                console.log(`Room ${roomId} created by ${socket.id}`);
            } catch (error) {
                console.error(`Room creation error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // Join room
        socket.on(config.SOCKET_EVENTS.JOIN_ROOM, (roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    throw new Error('Room not found');
                }

                if (room.candidate) {
                    throw new Error('Room is full');
                }

                room.candidate = socket.id;
                room.lastActivity = new Date();

                socket.join(roomId);

                // Notify interviewer
                socketServer.to(room.interviewer).emit(config.SOCKET_EVENTS.CANDIDATE_JOINED, {
                    candidateId: socket.id,
                    timestamp: new Date()
                });

                callback?.({ success: true, roomId });
                console.log(`User ${socket.id} joined room ${roomId}`);
            } catch (error) {
                console.error(`Join room error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // Offer signaling
        socket.on(config.SOCKET_EVENTS.OFFER, (offer, roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) throw new Error('Room not found');

                room.lastActivity = new Date();

                socket.to(roomId).emit(config.SOCKET_EVENTS.OFFER, {
                    offer,
                    from: socket.id,
                    timestamp: new Date()
                });

                callback?.({ success: true });
            } catch (error) {
                console.error(`Offer error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // Answer signaling
        socket.on(config.SOCKET_EVENTS.ANSWER, (answer, roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) throw new Error('Room not found');

                room.lastActivity = new Date();

                socket.to(roomId).emit(config.SOCKET_EVENTS.ANSWER, {
                    answer,
                    from: socket.id,
                    timestamp: new Date()
                });

                callback?.({ success: true });
            } catch (error) {
                console.error(`Answer error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // ICE candidate
        socket.on(config.SOCKET_EVENTS.ICE_CANDIDATE, (candidate, roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) throw new Error('Room not found');

                socket.to(roomId).emit(config.SOCKET_EVENTS.ICE_CANDIDATE, {
                    candidate,
                    from: socket.id,
                    timestamp: new Date()
                });

                callback?.({ success: true });
            } catch (error) {
                console.error(`ICE candidate error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // Leave room
        socket.on(config.SOCKET_EVENTS.LEAVE_ROOM, (roomId, callback) => {
            try {
                handleLeaveRoom(socket.id, roomId, socketServer);
                callback?.({ success: true });
            } catch (error) {
                callback?.({ success: false, error: error.message });
            }
        });

        // Handle disconnect
        socket.on(config.SOCKET_EVENTS.DISCONNECT, () => {
            console.log('User disconnected:', socket.id);
            handleDisconnect(socket.id, socketServer);
        });
    });
};

// Disconnect logic
const handleDisconnect = (socketId, socketServer) => {
    rooms.forEach((room, roomId) => {
        if (room.interviewer === socketId || room.candidate === socketId) {
            socketServer.to(roomId).emit(config.SOCKET_EVENTS.PARTICIPANT_DISCONNECTED, {
                userId: socketId,
                timestamp: new Date()
            });

            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted`);
        }
    });
};

// Leave room logic
const handleLeaveRoom = (socketId, roomId, socketServer) => {
    const room = rooms.get(roomId);
    if (room) {
        if (room.interviewer === socketId || room.candidate === socketId) {
            socketServer.to(roomId).emit(config.SOCKET_EVENTS.PARTICIPANT_LEFT, {
                userId: socketId,
                timestamp: new Date()
            });

            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted`);
        }
    }
};

module.exports = { setupSocket };


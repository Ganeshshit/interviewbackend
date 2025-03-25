const io = require('socket.io');

// Enhanced room management with more metadata
let rooms = new Map();

class Room {
    constructor(roomId, interviewer) {
        this.roomId = roomId;
        this.interviewer = interviewer;
        this.candidate = null;
        this.createdAt = new Date();
        this.status = 'waiting'; // waiting, active, ended
        this.connections = new Set();
        this.lastActivity = new Date();
        this.maxParticipants = 2;
    }
}

const setupSocket = (server) => {
    const socketServer = io(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 20000,
        pingInterval: 25000
    });

    socketServer.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Create room with enhanced validation
        socket.on('create-room', (roomId, callback) => {
            try {
                if (rooms.has(roomId)) {
                    throw new Error('Room already exists');
                }

                const room = new Room(roomId, socket.id);
                rooms.set(roomId, room);
                socket.join(roomId);
                
                // Send room creation confirmation
                callback?.({ success: true, roomId });
                console.log(`Room ${roomId} created by ${socket.id}`);

                // Set room cleanup timeout
                setTimeout(() => checkRoomActivity(roomId), 24 * 60 * 60 * 1000); // 24 hours
            } catch (error) {
                console.error(`Room creation error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // Join room with enhanced validation
        socket.on('join-room', (roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    throw new Error('Room not found');
                }

                if (room.status === 'ended') {
                    throw new Error('Room has ended');
                }

                if (room.connections.size >= room.maxParticipants) {
                    throw new Error('Room is full');
                }

                room.candidate = socket.id;
                room.connections.add(socket.id);
                room.status = 'active';
                room.lastActivity = new Date();
                
                socket.join(roomId);

                // Notify interviewer with candidate details
                socketServer.to(room.interviewer).emit('candidate-joined', {
                    candidateId: socket.id,
                    timestamp: new Date()
                });

                callback?.({ success: true, roomId });
                console.log(`User ${socket.id} joined room ${roomId}`);
            } catch (error) {
                console.error(`Room join error: ${error.message}`);
                callback?.({ success: false, error: error.message });
            }
        });

        // Enhanced signaling with error handling
        socket.on('offer', (offer, roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    throw new Error('Room not found');
                }

                room.lastActivity = new Date();
                socket.to(roomId).emit('offer', {
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

        // Enhanced answer handling
        socket.on('answer', (answer, roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    throw new Error('Room not found');
                }

                room.lastActivity = new Date();
                socket.to(roomId).emit('answer', {
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

        // Enhanced ICE candidate handling
        socket.on('ice-candidate', (candidate, roomId, callback) => {
            try {
                const room = rooms.get(roomId);
                if (!room) {
                    throw new Error('Room not found');
                }

                room.lastActivity = new Date();
                socket.to(roomId).emit('ice-candidate', {
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

        // Enhanced disconnect handling
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            handleDisconnect(socket.id, socketServer);
        });

        // Add connection quality monitoring
        socket.on('connection-quality', (data, roomId) => {
            const room = rooms.get(roomId);
            if (room) {
                socketServer.to(roomId).emit('quality-update', {
                    userId: socket.id,
                    ...data
                });
            }
        });

        // Add explicit room leave handling
        socket.on('leave-room', (roomId, callback) => {
            try {
                handleLeaveRoom(socket.id, roomId, socketServer);
                callback?.({ success: true });
            } catch (error) {
                callback?.({ success: false, error: error.message });
            }
        });
    });
};

// Helper functions
const handleDisconnect = (socketId, socketServer) => {
    rooms.forEach((room, roomId) => {
        if (room.interviewer === socketId || room.candidate === socketId) {
            room.connections.delete(socketId);
            
            // Notify remaining participants
            socketServer.to(roomId).emit('participant-disconnected', {
                userId: socketId,
                timestamp: new Date()
            });

            // Clean up room if empty
            if (room.connections.size === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} cleaned up`);
            } else if (room.interviewer === socketId) {
                room.status = 'ended';
                socketServer.to(roomId).emit('room-ended', {
                    reason: 'Interviewer disconnected'
                });
            }
        }
    });
};

const handleLeaveRoom = (socketId, roomId, socketServer) => {
    const room = rooms.get(roomId);
    if (room) {
        room.connections.delete(socketId);
        socketServer.to(roomId).emit('participant-left', {
            userId: socketId,
            timestamp: new Date()
        });

        if (room.connections.size === 0) {
            rooms.delete(roomId);
        }
    }
};

const checkRoomActivity = (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
        const inactiveTime = Date.now() - room.lastActivity.getTime();
        if (inactiveTime > 24 * 60 * 60 * 1000) { // 24 hours
            rooms.delete(roomId);
            console.log(`Inactive room ${roomId} cleaned up`);
        }
    }
};

module.exports = { 
    setupSocket, 
    createSignaling: (roomId) => {
        if (rooms.has(roomId)) {
            throw new Error('Room already exists');
        }
        rooms.set(roomId, new Room(roomId));
    },
    joinSignaling: (roomId) => {
        if (!rooms.has(roomId)) {
            throw new Error('Room does not exist');
        }
        return rooms.get(roomId);
    },
    getRoomStatus: (roomId) => {
        const room = rooms.get(roomId);
        return room ? {
            status: room.status,
            participants: room.connections.size,
            createdAt: room.createdAt,
            lastActivity: room.lastActivity
        } : null;
    }
};

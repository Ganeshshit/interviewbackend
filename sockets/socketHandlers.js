module.exports = (io) => {
    // Track active users and their data
    const activeUsers = new Map();
    const roomData = new Map();

    io.on('connection', (socket) => {
        console.log(`🔌 New socket connected: ${socket.id}`);

        // User registration
        socket.on('register-user', (userData) => {
            try {
                activeUsers.set(socket.id, {
                    ...userData,
                    socketId: socket.id,
                    joinedAt: new Date()
                });
                socket.emit('registration-success', { userId: socket.id });
            } catch (error) {
                socket.emit('error', { message: 'Failed to register user' });
            }
        });

        // Create interview room
        socket.on('create-room', ({ roomId, roomType }) => {
            try {
                roomData.set(roomId, {
                    host: socket.id,
                    type: roomType,
                    createdAt: new Date(),
                    participants: new Set([socket.id]),
                    status: 'waiting'
                });
                
                socket.join(roomId);
                socket.emit('room-created', { roomId });
                console.log(`Room ${roomId} created by ${socket.id}`);
            } catch (error) {
                socket.emit('error', { message: 'Failed to create room' });
            }
        });

        // Join room with enhanced functionality
        socket.on('join-room', (roomId) => {
            try {
                const room = roomData.get(roomId);
                if (!room) {
                    throw new Error('Room not found');
                }

                socket.join(roomId);
                room.participants.add(socket.id);
                room.status = 'active';

                // Get all users in the room
                const usersInRoom = Array.from(room.participants)
                    .map(id => activeUsers.get(id))
                    .filter(user => user);

                // Notify existing users
                socket.to(roomId).emit('user-joined', {
                    socketId: socket.id,
                    userData: activeUsers.get(socket.id)
                });

                // Send room data to new user
                socket.emit('room-joined', {
                    roomId,
                    participants: usersInRoom,
                    roomData: room
                });

                console.log(`User ${socket.id} joined room ${roomId}`);
            } catch (error) {
                console.error('Error handling room join:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Enhanced WebRTC signaling
        socket.on('signal', ({ userId, signal, type }) => {
            try {
                socket.to(userId).emit('signal', {
                    userId: socket.id,
                    signal,
                    type,
                    timestamp: new Date()
                });
                console.log(`${type} signal sent from ${socket.id} to ${userId}`);
            } catch (error) {
                socket.emit('error', { message: 'Failed to send signal' });
            }
        });

        // Chat functionality
        socket.on('send-message', ({ roomId, message }) => {
            try {
                const messageData = {
                    sender: socket.id,
                    senderData: activeUsers.get(socket.id),
                    message,
                    timestamp: new Date()
                };
                io.to(roomId).emit('new-message', messageData);
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Connection status updates
        socket.on('connection-status', ({ roomId, status }) => {
            try {
                io.to(roomId).emit('user-status-changed', {
                    userId: socket.id,
                    status,
                    timestamp: new Date()
                });
            } catch (error) {
                socket.emit('error', { message: 'Failed to update status' });
            }
        });

        // Enhanced leave room
        socket.on('leave-room', (roomId) => {
            try {
                handleUserLeave(socket, roomId);
            } catch (error) {
                console.error('Error handling room leave:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            try {
                handleUserDisconnect(socket);
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });

    // Helper function for user leave
    const handleUserLeave = (socket, roomId) => {
        const room = roomData.get(roomId);
        if (room) {
            room.participants.delete(socket.id);
            socket.leave(roomId);

            // Notify others
            socket.to(roomId).emit('user-left', {
                userId: socket.id,
                userData: activeUsers.get(socket.id)
            });

            // Clean up empty rooms
            if (room.participants.size === 0) {
                roomData.delete(roomId);
            }
            // Update room status if host leaves
            else if (room.host === socket.id) {
                room.status = 'ended';
                io.to(roomId).emit('room-ended', { reason: 'Host left' });
            }
        }
    };

    // Helper function for disconnect
    const handleUserDisconnect = (socket) => {
        // Clean up user from all rooms
        roomData.forEach((room, roomId) => {
            if (room.participants.has(socket.id)) {
                handleUserLeave(socket, roomId);
            }
        });

        // Remove from active users
        activeUsers.delete(socket.id);
    };
};

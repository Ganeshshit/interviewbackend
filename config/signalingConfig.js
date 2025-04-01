module.exports = {
    // CORS settings for allowing frontend connection
    CORS_OPTIONS: {
        origin: process.env.FRONTEND_URL || '*', // Allow requests from frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    },

    // Socket.IO heartbeat settings
    PING_TIMEOUT: 20000, // Timeout after 20 seconds of inactivity
    PING_INTERVAL: 25000, // Send heartbeat every 25 seconds

    // Room settings
    MAX_PARTICIPANTS: 2, // Maximum 2 participants (Interviewer + Candidate)
    ROOM_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours (in milliseconds)

    // Status options for room lifecycle
    ROOM_STATUS: {
        WAITING: 'waiting',
        ACTIVE: 'active',
        ENDED: 'ended'
    },

    // Event names (to avoid hardcoding strings)
    SOCKET_EVENTS: {
        CONNECTION: 'connection',
        CREATE_ROOM: 'create-room',
        JOIN_ROOM: 'join-room',
        OFFER: 'offer',
        ANSWER: 'answer',
        ICE_CANDIDATE: 'ice-candidate',
        DISCONNECT: 'disconnect',
        LEAVE_ROOM: 'leave-room',
        CANDIDATE_JOINED: 'candidate-joined',
        PARTICIPANT_DISCONNECTED: 'participant-disconnected',
        ROOM_ENDED: 'room-ended',
        PARTICIPANT_LEFT: 'participant-left',
        CONNECTION_QUALITY: 'connection-quality',
        QUALITY_UPDATE: 'quality-update'
    }
};

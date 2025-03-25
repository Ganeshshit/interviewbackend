const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    hostId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'ended'],
        default: 'waiting'
    },
    participants: [{
        userId: String,
        role: String,
        joinedAt: Date
    }],
    messages: [{
        sender: String,
        content: String,
        timestamp: Date
    }],
    recording: {
        isActive: Boolean,
        startedAt: Date,
        endedAt: Date,
        url: String
    },
    quality: {
        rtt: Number,
        packetLoss: Number,
        bandwidth: Number,
        timestamp: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    endedAt: Date
});

module.exports = mongoose.model('Call', callSchema); 
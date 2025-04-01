const Call = require('../models/Call');
const { v4: uuidv4 } = require('uuid');
const { connectionQualityThresholds } = require('../config/turnConfig');

const callController = {
    // Create a new call session
    createCall: async (req, res) => {
        try {
            const { hostId, title } = req.body;
            const roomId = uuidv4();

            const call = await Call.create({
                roomId,
                hostId,
                title,
                status: 'waiting',
                participants: [{
                    userId: hostId,
                    role: 'host',
                    joinedAt: new Date()
                }]
            });

            res.status(201).json({
                success: true,
                callId: call.roomId,
                message: 'Call created successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create call',
                error: error.message
            });
        }
    },

    // Join an existing call
    joinCall: async (req, res) => {
        try {
            const { roomId, userId, role } = req.body;

            const call = await Call.findOne({ roomId });
            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }
         

            if (call.status === 'ended') {
                return res.status(400).json({
                    success: false,
                    message: 'Call has ended'
                });
            }

            // Add participant if not already in call
            if (!call.participants.find(p => p.userId === userId)) {
                call.participants.push({
                    userId,
                    role,
                    joinedAt: new Date()
                });
                call.status = 'active';
                await call.save();
            }

            res.status(200).json({
                success: true,
                call: {
                    roomId: call.roomId,
                    status: call.status,
                    participants: call.participants
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to join call',
                message: 'An unexpected error occurred. Please try again later.',
                error: error.message
            });
        }
    },

    // End an active call
    endCall: async (req, res) => {
        try {
            const { roomId, userId } = req.body;

            const call = await Call.findOne({ roomId });
            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }

            const participant = call.participants.find(p => p.userId === userId);
            if (!participant || (participant.role !== 'host' && participant.role !== 'interviewer')) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to end call'
                });
            }

            call.status = 'ended';
            call.endedAt = new Date();
            await call.save();

            res.status(200).json({
                success: true,
                message: 'Call ended successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to end call',
                error: error.message
            });
        }
    },

    // Get call status and details
    getCallStatus: async (req, res) => {
        try {
            const { roomId } = req.params;

            const call = await Call.findOne({ roomId });
            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }

            res.status(200).json({
                success: true,
                call: {
                    roomId: call.roomId,
                    status: call.status,
                    participants: call.participants,
                    quality: call.quality,
                    recording: call.recording
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get call status',
                error: error.message
            });
        }
    },

    // Start call recording
    startRecording: async (req, res) => {
        try {
            const { callId, userId } = req.body;

            const call = await Call.findById(callId);
            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }

            // Check if user is participant
            if (!call.participants.includes(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to record this call'
                });
            }

            // Start recording logic here
            // This would typically integrate with a recording service
            call.isRecording = true;
            call.recordingStartTime = new Date();
            await call.save();

            res.status(200).json({
                success: true,
                message: 'Recording started'
            });
        } catch (error) {
            console.error('Error starting recording:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to start recording',
                error: error.message
            });
        }
    },

    // Stop call recording
    stopRecording: async (req, res) => {
        try {
            const { callId, userId } = req.body;

            const call = await Call.findById(callId);
            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }

            if (!call.isRecording) {
                return res.status(400).json({
                    success: false,
                    message: 'Call is not being recorded'
                });
            }

            // Stop recording logic here
            // This would typically integrate with a recording service
            call.isRecording = false;
            call.recordingEndTime = new Date();
            // Store recording URL after processing
            call.recordingUrl = `https://your-storage-service.com/recordings/${callId}`;
            await call.save();

            res.status(200).json({
                success: true,
                message: 'Recording stopped',
                recordingUrl: call.recordingUrl
            });
        } catch (error) {
            console.error('Error stopping recording:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to stop recording',
                error: error.message
            });
        }
    },

    // Update call quality metrics
    updateCallQuality: async (req, res) => {
        try {
            const { callId, rtt, packetLoss, bandwidth } = req.body;

            const call = await Call.findById(callId);
            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }

            // Update quality metrics
            call.quality = {
                rtt,
                packetLoss,
                bandwidth,
                timestamp: new Date(),
                level: calculateQualityLevel(rtt, packetLoss, bandwidth)
            };

            await call.save();

            res.status(200).json({
                success: true,
                quality: call.quality
            });
        } catch (error) {
            console.error('Error updating call quality:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update call quality',
                error: error.message
            });
        }
    },

    // Helper function to calculate quality level
    calculateQualityLevel: (rtt, packetLoss, bandwidth) => {
        if (rtt <= connectionQualityThresholds.excellent.rtt &&
            packetLoss <= connectionQualityThresholds.excellent.packetLoss &&
            bandwidth >= connectionQualityThresholds.excellent.bandwidth) {
            return 'excellent';
        } else if (rtt <= connectionQualityThresholds.good.rtt &&
            packetLoss <= connectionQualityThresholds.good.packetLoss &&
            bandwidth >= connectionQualityThresholds.good.bandwidth) {
            return 'good';
        } else {
            return 'poor';
        }
    },

    // Leave a call
    leaveCall: async (req, res) => {
        try {
            const { callId, participantId } = req.body;
            const call = await Call.findById(callId);

            if (!call) {
                return res.status(404).json({
                    success: false,
                    message: 'Call not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Left call successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Start screen sharing
    startScreenShare: async (req, res) => {
        try {
            const { callId, participantId } = req.body;
            res.status(200).json({
                success: true,
                message: 'Screen sharing started'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Stop screen sharing
    stopScreenShare: async (req, res) => {
        try {
            const { callId, participantId } = req.body;
            res.status(200).json({
                success: true,
                message: 'Screen sharing stopped'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = callController; 

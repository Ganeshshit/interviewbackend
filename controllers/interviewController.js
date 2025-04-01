
const {v4:uuidv4} = require('uuid');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const {createSignaling,getRoomStatus} = require('../service/signalingService');

const interviewController = {
    createInterview: async (req, res) => {
        try {
            const roomId=uuidv4();
            const { interviewerId, scheduledTime } = req.body;
            const interview = await Interview.create({
                interviewerId,
                scheduledTime,
                status: 'scheduled',
                roomId: roomId
            });
            res.status(201).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    joinInterview: async (req, res) => {
        try {
            const { interviewId, candidateId } = req.body;
            const interview = await Interview.findByIdAndUpdate(
                interviewId,
                { 
                    candidateId,
                    status: 'active'
                },
                { new: true }
            );
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getInterview: async (req, res) => {
        try {
            const interview = await Interview.findById(req.params.id)
                .populate('currentQuestion');
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    endInterview: async (req, res) => {
        try {
            const interview = await Interview.findByIdAndUpdate(
                req.params.id,
                { status: 'completed' },
                { new: true }
            );
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    submitCode: async (req, res) => {
        try {
            const { interviewId, code, language } = req.body;
            const interview = await Interview.findByIdAndUpdate(
                interviewId,
                { 
                    'codeSubmission.code': code,
                    'codeSubmission.language': language,
                    'codeSubmission.submittedAt': new Date()
                },
                { new: true }
            );
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getQuestions: async (req, res) => {
        try {
            const questions = await Question.find();
            res.status(200).json({ success: true, questions });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    assignQuestion: async (req, res) => {
        try {
            const { interviewId, questionId } = req.body;
            const interview = await Interview.findByIdAndUpdate(
                interviewId,
                { currentQuestion: questionId },
                { new: true }
            ).populate('currentQuestion');
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = interviewController; 




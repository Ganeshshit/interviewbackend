const express = require('express');
const { body, param } = require('express-validator');
const interviewController = require('../controllers/interviewController');

const router = express.Router();

// Create an interview
router.post(
    '/create',
    [
        body('interviewerId').notEmpty().withMessage('Interviewer ID is required'),
        body('scheduledTime').isISO8601().withMessage('Scheduled time must be a valid date'),
    ],
    interviewController.createInterview
);



// Join an interview
router.post(
    '/join',
    [
        body('interviewId').notEmpty().withMessage('Interview ID is required'),
        body('candidateId').notEmpty().withMessage('Candidate ID is required'),
    ],
    interviewController.joinInterview
);

// Get interview details by ID
router.get(
    '/:id',
    param('id').notEmpty().withMessage('Interview ID is required'),
    interviewController.getInterview
);

// End an interview
router.put(
    '/:id/end',
    param('id').notEmpty().withMessage('Interview ID is required'),
    interviewController.endInterview
);

// Submit code during an interview
router.post(
    '/submit-code',
    [
        body('interviewId').notEmpty().withMessage('Interview ID is required'),
        body('code').notEmpty().withMessage('Code cannot be empty'),
        body('language').notEmpty().withMessage('Language is required'),
    ],
    interviewController.submitCode
);

// Get all available questions
router.get('/questions', interviewController.getQuestions);

// Assign a question to an interview
router.post(
    '/assign-question',
    [
        body('interviewId').notEmpty().withMessage('Interview ID is required'),
        body('questionId').notEmpty().withMessage('Question ID is required'),
    ],
    interviewController.assignQuestion
);

module.exports = router;



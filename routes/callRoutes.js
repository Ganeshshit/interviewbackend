const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const asyncHandler = require('express-async-handler');
const { body, param } = require('express-validator');

// Create Call Route
router.post(
    '/create',
    [
        body('hostId').notEmpty().withMessage('Host ID is required'),
        body('title').notEmpty().withMessage('Title is required')
    ],
    asyncHandler(callController.createCall)
);

// Join Call Route
router.post(
    '/:roomId/join',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    asyncHandler(callController.joinCall)
);

// Leave Call Route
router.post(
    '/:roomId/leave',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    asyncHandler(callController.leaveCall)
);

// End Call Route
router.post(
    '/:roomId/end',
    [
        param('roomId').notEmpty().withMessage('Room ID is required')
    ],
    asyncHandler(callController.endCall)
);

// Start Screen Share Route
router.post(
    '/:roomId/screen-share/start',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    asyncHandler(callController.startScreenShare)
);

// Stop Screen Share Route
router.post(
    '/:roomId/screen-share/stop',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    asyncHandler(callController.stopScreenShare)
);

// Start Recording Route
router.post(
    '/:roomId/recording/start',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    asyncHandler(callController.startRecording)
);

// Stop Recording Route
router.post(
    '/:roomId/recording/stop',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    asyncHandler(callController.stopRecording)
);

// Get Call Status Route
router.get(
    '/:roomId/status',
    [
        param('roomId').notEmpty().withMessage('Room ID is required')
    ],
    asyncHandler(callController.getCallStatus)
);

// Update Call Quality Route
router.post(
    '/:roomId/quality/update',
    [
        param('roomId').notEmpty().withMessage('Room ID is required'),
        body('quality').notEmpty().withMessage('Quality is required')
    ],
    asyncHandler(callController.updateCallQuality)
);

module.exports = router;

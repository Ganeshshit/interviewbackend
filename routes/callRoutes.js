const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

// Make sure all controller functions are properly imported and defined
router.post('/create', callController.createCall);
router.post('/join', callController.joinCall);
router.post('/leave', callController.leaveCall);
router.post('/screen-share/start', callController.startScreenShare);
router.post('/screen-share/stop', callController.stopScreenShare);
router.get('/status/:roomId', callController.getCallStatus);

module.exports = router;

const express = require('express');
const { sendMeetingEmail } = require('../controllers/emailController');

const router = express.Router();

router.post('/send', sendMeetingEmail);

module.exports = router;

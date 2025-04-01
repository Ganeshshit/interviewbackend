const express = require('express');
const { body } = require('express-validator');
const { sendMeetingEmail } = require('../controllers/emailController');

const router = express.Router();

// router.post(
//     '/send',
//     [
//         body('receiverEmail')
//             .isEmail()
//             .withMessage('Invalid receiver email'),
//         body('candidateName')
//             .notEmpty()
//             .withMessage('Candidate name is required'),
//         body('roomLink')
//             .notEmpty()
//             .withMessage('Room link is required'),
//         body('interviewTime')
//             .optional()
//             .isISO8601()
//             .withMessage('Invalid date format'),
//         body('message')
//             .optional()
//             .isString()
//             .withMessage('Message must be a string')
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         await sendMeetingEmail(req, res);
//     }
// );
router.post('/send', sendMeetingEmail);
// router.post('/send', (req, res) => {
//     console.log('Request received:', req.body);
//     res.status(200).json({ message: 'Email sent successfully' });
// });
module.exports = router;

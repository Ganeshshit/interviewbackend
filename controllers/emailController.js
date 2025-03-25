const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMeetingEmail = async (req, res) => {
    const {
        receiverEmail,
        candidateName,
        interviewerName = 'Not Assigned', // Added fallback
        roomLink,
        interviewTime,
        message
    } = req.body;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!receiverEmail || !candidateName || !roomLink) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Create reusable transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            timeout: 10000
        });

        // Verify transporter connection
        await transporter.verify();

        // Enhanced Email Content with Styling
        const mailOptions = {
            from: `"Live Coding Platform" <${process.env.EMAIL_USER}>`,
            to: receiverEmail,
            subject: `📩 Interview Request from ${candidateName}`,
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    color: #333;
                ">
                    <h2 style="color: #4CAF50; margin-bottom: 10px;">🎯 New Interview Meeting Request</h2>
                    <p style="font-size: 16px; line-height: 24px;">
                        <strong>👤 Candidate Name:</strong> ${candidateName} <br>
                        <strong>👨‍💼 Interviewer Name:</strong> ${interviewerName} <br>
                        <strong>📅 Scheduled Time:</strong> ${interviewTime || 'To be confirmed'} <br>
                        <strong>🔗 Room Link:</strong> <a href="${roomLink}" target="_blank" style="color: #4CAF50; text-decoration: none;">Join Meeting</a>
                    </p>
                    
                    ${message ? `
                        <div style="
                            margin-top: 20px;
                            padding: 15px;
                            background-color: #f1f1f1;
                            border-left: 5px solid #4CAF50;
                        ">
                            <strong>📝 Message:</strong>
                            <p>${message}</p>
                        </div>
                    ` : ''}

                    <hr style="border: 0; height: 1px; background-color: #e0e0e0; margin: 20px 0;">
                    <p style="color: #555; font-size: 14px; text-align: center;">
                        🚀 Kindly join the session on time. If you have any issues, contact support.
                    </p>
                </div>
            `,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(info)

        res.status(200).json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { sendMeetingEmail };

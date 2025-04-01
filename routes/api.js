const express = require('express');
const router = express.Router();

const interviewRoutes = require('./interviewRoutes');

router.use('/interview', interviewRoutes);
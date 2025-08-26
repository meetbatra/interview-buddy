const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { startInterview, getNextQuestion, getReport, createSampleSession } = require("../controllers/interview");

const router = express.Router();
const upload = multer({ dest: "uploads/"});

// Protected routes - require authentication
router.post('/start', auth, upload.single('resume'), startInterview);
router.post('/:sessionId/next', auth, getNextQuestion);
router.get('/:sessionId/report', auth, getReport);

// Test endpoint (development only)
router.post('/create-sample', createSampleSession);

module.exports = router;
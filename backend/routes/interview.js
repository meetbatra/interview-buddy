const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { startInterview, getNextQuestion, getReport } = require("../controllers/interview");

const router = express.Router();
const upload = multer({ dest: "uploads/"});

// Protected routes - require authentication
router.post('/start', auth, upload.single('resume'), startInterview);
router.post('/:sessionId/next', auth, getNextQuestion);
router.get('/:sessionId/report', auth, getReport);

module.exports = router;
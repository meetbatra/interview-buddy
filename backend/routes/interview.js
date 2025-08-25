const express = require('express');
const multer = require('multer');
const { startInterview, getNextQuestion, getReport, createSampleSession } = require("../controllers/interview");

const router = express.Router();
const upload = multer({ dest: "uploads/"});

router.post('/start', upload.single('resume'), startInterview);
router.post('/:sessionId/next', getNextQuestion);
router.get('/:sessionId/report', getReport);

// Test endpoint (development only)
router.post('/create-sample', createSampleSession);

module.exports = router;
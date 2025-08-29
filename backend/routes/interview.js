const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { startInterview, getNextQuestion, getReport, transcribeAudio } = require("../controllers/interview");

const router = express.Router();
const upload = multer({ dest: "uploads/"});
const audioUpload = multer({ 
  dest: "uploads/audio/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for audio files
});

// Protected routes - require authentication
router.post('/start', auth, upload.single('resume'), startInterview);
router.post('/:sessionId/transcribe', auth, audioUpload.single('audio'), transcribeAudio);
router.post('/:sessionId/next', auth, getNextQuestion);
router.get('/:sessionId/report', auth, getReport);

module.exports = router;
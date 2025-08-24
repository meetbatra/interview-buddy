const express = require('express');
const multer = require('multer');
const { startInterview, getNextQuestion } = require("../controllers/interview");

const router = express.Router();
const upload = multer({ dest: "uploads/"});

router.post('/start', upload.single('resume'), startInterview);
router.post('/:sessionId/next', getNextQuestion);

module.exports = router;
const express = require('express');
const multer = require('multer');
const { startInterview } = require("../controllers/interview");

const router = express.Router();
const upload = multer({ dest: "uploads/"});

router.post('/start', upload.single('resume'), startInterview);

module.exports = router;
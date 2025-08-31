const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);

module.exports = router;

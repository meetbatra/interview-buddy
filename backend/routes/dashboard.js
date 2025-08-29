const express = require('express');
const auth = require('../middleware/auth');
const { 
  getDashboardData, 
  getInterviewHistory
} = require('../controllers/dashboard');

const router = express.Router();

// All dashboard routes require authentication
router.get('/overview', auth, getDashboardData);
router.get('/history', auth, getInterviewHistory);

module.exports = router;

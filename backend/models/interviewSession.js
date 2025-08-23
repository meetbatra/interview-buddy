const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  resumeText: {
    type: String,
    required: true
  },
  bio: String,
  conversation: [conversationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
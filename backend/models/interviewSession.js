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

const analysisSchema = new mongoose.Schema({
  summary: String,
  scores: {
    technical: Number,
    communication: Number,
    confidence: Number
  },
  strengths: [String],
  weaknesses: [String]
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  bio: String,
  conversation: [conversationSchema],
  analysis: analysisSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
interviewSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
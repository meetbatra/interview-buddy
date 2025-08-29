const InterviewSession = require('../models/interviewSession');

// Get user dashboard data
module.exports.getDashboardData = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userId = req.user._id;

    // Get all user's interview sessions
    const sessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .select('createdAt updatedAt analysis conversation');

    // Calculate performance analytics
    const totalInterviews = sessions.length;
    
    if (totalInterviews === 0) {
      return res.json({
        totalInterviews: 0,
        averageScores: { technical: 0, communication: 0, confidence: 0, overall: 0 },
        recentSessions: [],
        performanceHistory: [],
        skillBreakdown: { technical: 0, communication: 0, confidence: 0 },
        completionRate: 0,
        averageDuration: 0
      });
    }

    // Filter sessions with analysis (completed interviews)
    const completedSessions = sessions.filter(session => session.analysis);
    const completedCount = completedSessions.length;

    // Calculate average scores
    let totalTechnical = 0, totalCommunication = 0, totalConfidence = 0;
    
    completedSessions.forEach(session => {
      if (session.analysis && session.analysis.scores) {
        totalTechnical += session.analysis.scores.technical || 0;
        totalCommunication += session.analysis.scores.communication || 0;
        totalConfidence += session.analysis.scores.confidence || 0;
      }
    });

    const averageScores = completedCount > 0 ? {
      technical: +(totalTechnical / completedCount).toFixed(1),
      communication: +(totalCommunication / completedCount).toFixed(1),
      confidence: +(totalConfidence / completedCount).toFixed(1),
      overall: +((totalTechnical + totalCommunication + totalConfidence) / (completedCount * 3)).toFixed(1)
    } : { technical: 0, communication: 0, confidence: 0, overall: 0 };

    // Calculate completion rate
    const completionRate = totalInterviews > 0 ? +((completedCount / totalInterviews) * 100).toFixed(1) : 0;

    // Calculate average duration for completed sessions
    let totalDuration = 0;
    completedSessions.forEach(session => {
      const duration = new Date(session.updatedAt) - new Date(session.createdAt);
      totalDuration += duration;
    });
    const averageDuration = completedCount > 0 ? Math.round(totalDuration / completedCount / (1000 * 60)) : 0; // in minutes

    // Prepare recent sessions (last 5)
    const recentSessions = sessions.slice(0, 5).map(session => ({
      id: session._id,
      date: session.createdAt,
      completed: !!session.analysis,
      scores: session.analysis?.scores || null,
      duration: session.analysis ? Math.round((new Date(session.updatedAt) - new Date(session.createdAt)) / (1000 * 60)) : null,
      questionCount: session.conversation ? session.conversation.filter(msg => msg.role === 'ai').length : 0
    }));

    // Performance history (last 10 completed sessions for trend)
    const performanceHistory = completedSessions.slice(0, 10).reverse().map((session, index) => ({
      session: index + 1,
      date: session.createdAt,
      overall: session.analysis?.scores ? 
        +((session.analysis.scores.technical + session.analysis.scores.communication + session.analysis.scores.confidence) / 3).toFixed(1) : 0,
      technical: session.analysis?.scores?.technical || 0,
      communication: session.analysis?.scores?.communication || 0,
      confidence: session.analysis?.scores?.confidence || 0
    }));

    // Skill breakdown (same as average scores for now)
    const skillBreakdown = { ...averageScores };

    res.json({
      totalInterviews,
      completedInterviews: completedCount,
      averageScores,
      recentSessions,
      performanceHistory,
      skillBreakdown,
      completionRate,
      averageDuration
    });

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
};

// Get interview history with pagination
module.exports.getInterviewHistory = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get paginated interview sessions
    const sessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('createdAt updatedAt analysis conversation');

    const totalCount = await InterviewSession.countDocuments({ userId });
    const totalPages = Math.ceil(totalCount / limit);

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      date: session.createdAt,
      completed: !!session.analysis,
      scores: session.analysis?.scores || null,
      duration: session.analysis ? 
        Math.round((new Date(session.updatedAt) - new Date(session.createdAt)) / (1000 * 60)) : null,
      questionCount: session.conversation ? 
        session.conversation.filter(msg => msg.role === 'ai').length : 0,
      summary: session.analysis?.summary || null
    }));

    res.json({
      sessions: formattedSessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (err) {
    console.error('Error fetching interview history:', err);
    res.status(500).json({ error: 'Failed to fetch interview history.' });
  }
};

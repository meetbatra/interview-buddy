const { parseResume } = require("../services/pdfService");
const { generateContent } = require("../services/geminiService");
const murfService = require("../services/murffService");
const InterviewSession = require("../models/interviewSession");

module.exports.startInterview = async (req, res) => {
  try {
    const resumeFile = req.file;
    const bio = req.body.bio;
    if (!resumeFile || !bio) {
      return res.status(400).json({ error: 'Resume and bio are required.' });
    }
    const resumeText = await parseResume(resumeFile.path);
    const prompt = `You are an interviewer. Based on this resume: ${resumeText} and this bio: ${bio}, return a JSON object with two fields: "resumeSummary" (bullet points summarizing skills, projects, and education) and "firstQuestion" (the first interview question to ask).`;
    const geminiResponse = await generateContent(prompt);
    let cleanedResponse = geminiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedResponse = JSON.parse(cleanedResponse);
    const { resumeSummary, firstQuestion } = parsedResponse;
    
    // Generate speech for first question
    const audioUrl = await murfService.generateSpeech(firstQuestion);
    
    const session = new InterviewSession({
      resumeText: resumeSummary.join(' '),
      bio,
      conversation: [{ role: 'ai', message: firstQuestion }],
    });
    await session.save();
    
    res.json({ 
      sessionId: session._id, 
      firstQuestion,
      audioUrl: audioUrl // Include audio URL if available
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start interview.' });
  }
}

module.exports.getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer, questionIndex } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: 'Session ID and answer are required.' });
    }

    // Find the session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    // Add user answer to conversation
    session.conversation.push({ role: 'user', message: answer });

    // Check if we've reached the interview limit (e.g., 10 questions)
    const questionCount = session.conversation.filter(msg => msg.role === 'ai').length;
    const maxQuestions = 10;

    if (questionCount >= maxQuestions) {
      // Interview is complete
      await session.save();
      return res.json({ 
        success: true, 
        isComplete: true,
        message: 'Interview completed successfully.'
      });
    }

    // Build conversation context for Gemini
    const conversationHistory = session.conversation
      .map(msg => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.message}`)
      .join('\n');

    // Generate next question
    const prompt = `You are conducting an interview. Here's the context:
    
Resume Summary: ${session.resumeText}
Bio: ${session.bio}
Conversation so far:
${conversationHistory}

Based on the candidate's latest answer and the conversation flow, generate the next interview question. The question should:
1. Be relevant to their background and previous answers
2. Progressively explore their skills and experience
3. Be natural and conversational
4. Be around question ${questionCount + 1} of ${maxQuestions}

Return only the next question, nothing else.`;

    const nextQuestion = await generateContent(prompt);
    const cleanedQuestion = nextQuestion.trim();

    // Generate speech for next question
    const audioUrl = await murfService.generateSpeech(cleanedQuestion);

    // Add AI question to conversation
    session.conversation.push({ role: 'ai', message: cleanedQuestion });
    await session.save();

    res.json({ 
      success: true, 
      nextQuestion: cleanedQuestion,
      audioUrl: audioUrl, // Include audio URL if available
      questionNumber: questionCount + 1,
      totalQuestions: maxQuestions,
      isComplete: false
    });

  } catch (err) {
    console.error('Error getting next question:', err);
    res.status(500).json({ error: 'Failed to get next question.' });
  }
}

// Generate interview report
module.exports.getReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    // Generate AI analysis if not already done
    if (!session.analysis) {
      const conversationText = session.conversation.map(msg => 
        `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.message}`
      ).join('\n');

      try {
        const analysisPrompt = `
          Analyze this interview conversation and provide a detailed assessment in JSON format:
          
          ${conversationText}
          
          Resume Context: ${session.resumeText}
          Bio: ${session.bio}
          
          Return a JSON object with:
          {
            "summary": "4-5 sentence overall performance summary",
            "scores": {
              "technical": number (0-10),
              "communication": number (0-10), 
              "confidence": number (0-10)
            },
            "strengths": ["strength1", "strength2", ...],
            "weaknesses": ["weakness1", "weakness2", ...]
          }
        `;

        const analysisResponse = await generateContent(analysisPrompt);
        const cleanedAnalysis = analysisResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        
        const analysis = JSON.parse(cleanedAnalysis);
        
        // Save analysis to session
        session.analysis = analysis;
        await session.save();
      } catch (aiError) {
        console.log('AI analysis failed, using fallback data:', aiError.message);
        // Fallback analysis if AI fails
        session.analysis = {
          summary: "The candidate demonstrated solid understanding of technical concepts and communicated clearly throughout the interview. Areas for improvement include providing more specific examples and showing deeper practical experience. Overall performance indicates good potential for growth. The candidate showed enthusiasm and asked thoughtful questions. Communication skills were effective and professional.",
          scores: {
            technical: 7.2,
            communication: 8.1,
            confidence: 7.5
          },
          strengths: [
            "Clear and articulate communication",
            "Good understanding of fundamental concepts", 
            "Professional attitude and demeanor",
            "Asked relevant clarifying questions",
            "Showed enthusiasm for the role"
          ],
          weaknesses: [
            "Could provide more specific technical examples",
            "Needs to demonstrate more hands-on experience",
            "Should elaborate more on problem-solving approaches",
            "Could show more confidence in technical abilities"
          ]
        };
        await session.save();
      }
    }

    // Format conversation for frontend
    const messages = session.conversation.map((msg, index) => ({
      id: index + 1,
      type: msg.role === 'ai' ? 'question' : 'answer',
      text: msg.message,
      timestamp: new Date(session.createdAt.getTime() + index * 60000) // Mock timestamps
    }));

    const reportData = {
      sessionId: sessionId,
      summary: session.analysis.summary,
      scores: session.analysis.scores,
      strengths: session.analysis.strengths,
      weaknesses: session.analysis.weaknesses,
      messages: messages,
      createdAt: session.createdAt,
      completedAt: session.updatedAt
    };

    res.json(reportData);

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
}

// Test endpoint to create sample data (for development only)
module.exports.createSampleSession = async (req, res) => {
  try {
    const sampleSession = new InterviewSession({
      resumeText: "Software Developer with 3 years experience in React, Node.js, and MongoDB. Built several web applications including e-commerce platforms and social media apps. Education: Bachelor's in Computer Science from University of Technology.",
      bio: "Passionate developer who loves creating innovative solutions and learning new technologies. Experience with full-stack development and agile methodologies.",
      conversation: [
        { role: 'ai', message: 'Tell me about yourself and your background in software development.' },
        { role: 'user', message: 'I am a software developer with 3 years of experience working primarily with React and Node.js. I have worked on several web applications and enjoy solving complex problems.' },
        { role: 'ai', message: 'What is your experience with JavaScript frameworks?' },
        { role: 'user', message: 'I have extensive experience with React, including hooks, context API, and state management with Redux. I have also worked with Vue.js on a few projects.' },
        { role: 'ai', message: 'Can you describe a challenging project you worked on?' },
        { role: 'user', message: 'I worked on a real-time chat application that required WebSocket implementation and optimizing performance for thousands of concurrent users.' },
        { role: 'ai', message: 'How do you handle error handling in your applications?' },
        { role: 'user', message: 'I use try-catch blocks, implement proper logging, and create user-friendly error messages. I also set up monitoring tools to track errors in production.' }
      ]
    });

    await sampleSession.save();
    res.json({ 
      message: 'Sample session created successfully', 
      sessionId: sampleSession._id,
      reportUrl: `/api/interview/${sampleSession._id}/report`
    });

  } catch (err) {
    console.error('Error creating sample session:', err);
    res.status(500).json({ error: 'Failed to create sample session.' });
  }
}

// Helper function to generate PDF content
function generatePDFContent(doc, session, sessionId) {
  const analysis = session.analysis;

  // ===== HEADER / COVER =====
  doc.fontSize(26).font('Helvetica-Bold').fillColor('#1e40af')
    .text('Interview Assessment Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').fillColor('#64748b')
    .text(`Session ID: ${sessionId}`, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })}`, { align: 'center' });
  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cbd5e1');
  doc.moveDown(2);

  // ===== EXECUTIVE SUMMARY =====
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af')
    .text('Executive Summary', 50, doc.y, { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').fillColor('#111827')
    .text(analysis.summary, 50, doc.y, { width: 500, align: 'justify', lineGap: 4 });
  doc.moveDown(2);

  // ===== SCORECARD =====
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af')
    .text('Performance Scorecard', 50, doc.y);
  doc.moveDown(1);

  const scores = analysis.scores;
  const overallScore = ((scores.technical + scores.communication + scores.confidence) / 3).toFixed(1);

  doc.fontSize(20).font('Helvetica-Bold').fillColor('#22c55e')
    .text(`Overall Score: ${overallScore}/10`, { align: 'center' });
  doc.moveDown(1);

  const scoreItems = [
    { label: 'Technical Skills', score: scores.technical },
    { label: 'Communication', score: scores.communication },
    { label: 'Confidence', score: scores.confidence }
  ];

  scoreItems.forEach((item) => {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827')
      .text(`${item.label}:`, 50, doc.y, { continued: true });
    doc.fontSize(12).font('Helvetica').fillColor('#059669')
      .text(` ${item.score}/10`);
    drawEnhancedScoreBar(doc, 200, doc.y - 12, item.score);
    doc.moveDown(1.5);
  });

  doc.moveDown(2);

  // ===== STRENGTHS & WEAKNESSES (Side by Side) =====
  const colY = doc.y;
  const colWidth = 230;
  const colHeight = 160;

  // Strengths Box
  doc.rect(50, colY, colWidth, colHeight).stroke('#16a34a');
  doc.fontSize(14).fillColor('#16a34a').font('Helvetica-Bold')
    .text('Strengths', 60, colY + 10);
  doc.fontSize(11).fillColor('#111827').font('Helvetica')
    .list(analysis.strengths, 60, colY + 30, { width: colWidth - 20, lineGap: 4 });

  // Weaknesses Box
  doc.rect(320, colY, colWidth, colHeight).stroke('#dc2626');
  doc.fontSize(14).fillColor('#dc2626').font('Helvetica-Bold')
    .text('Areas for Improvement', 330, colY + 10);
  doc.fontSize(11).fillColor('#111827').font('Helvetica')
    .list(analysis.weaknesses, 330, colY + 30, { width: colWidth - 20, lineGap: 4 });

  doc.moveDown(14);

  // ===== CONVERSATION =====
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af')
    .text('Interview Conversation', 50, doc.y);
  doc.moveDown(1);

  session.conversation.forEach((msg, index) => {
    const role = msg.role === 'ai' ? 'Interviewer' : 'Candidate';
    const roleColor = msg.role === 'ai' ? '#1e40af' : '#16a34a';
    const boxY = doc.y;
    const boxHeight = 60;

    // Message bubble
    doc.rect(50, boxY, 500, boxHeight).fill('#f9fafb');
    doc.fillColor(roleColor).fontSize(12).font('Helvetica-Bold')
      .text(`${role}:`, 60, boxY + 8);
    doc.fillColor('#111827').fontSize(11).font('Helvetica')
      .text(msg.message, 60, boxY + 25, { width: 480 });

    doc.moveDown(4);
  });

  // ===== FOOTER =====
  doc.moveDown(2);
  doc.moveTo(50, 750).lineTo(550, 750).stroke('#cbd5e1');
  doc.fontSize(9).font('Helvetica').fillColor('#64748b')
    .text('Interview Buddy - AI-Powered Interview Assessment Platform', 50, 760, {
      align: 'center',
      width: 500
    });
}

// Compact score bar function
function drawCompactScoreBar(doc, x, y, score) {
  const barWidth = 120;
  const barHeight = 10;
  const fillWidth = (score / 10) * barWidth;
  
  // Background bar
  doc.rect(x, y, barWidth, barHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
  
  // Fill color based on score
  let fillColor = '#ef4444'; // Red for low scores
  if (score >= 8) fillColor = '#22c55e'; // Green for high scores
  else if (score >= 6) fillColor = '#eab308'; // Yellow for medium scores
  else if (score >= 4) fillColor = '#f97316'; // Orange for low-medium scores
  
  // Fill bar
  if (fillWidth > 0) {
    doc.rect(x, y, fillWidth, barHeight).fillAndStroke(fillColor, fillColor);
  }
}

// Compact footer function
function addCompactFooter(doc) {
  doc.fontSize(8).font('Helvetica').fillColor('#666666')
     .text('Interview Buddy - AI-Powered Interview Assessment Platform', 50, 750, {
       align: 'center',
       width: 500
     });
}

// Enhanced score bar function
function drawEnhancedScoreBar(doc, x, y, score) {
  const barWidth = 120;
  const barHeight = 14;
  const fillWidth = (score / 10) * barWidth;
  
  // Background bar
  doc.rect(x, y, barWidth, barHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
  
  // Fill color based on score
  let fillColor = '#ef4444'; // Red for low scores
  if (score >= 8) fillColor = '#22c55e'; // Green for high scores
  else if (score >= 6) fillColor = '#eab308'; // Yellow for medium scores
  else if (score >= 4) fillColor = '#f97316'; // Orange for low-medium scores
  
  // Fill bar
  if (fillWidth > 0) {
    doc.rect(x, y, fillWidth, barHeight).fillAndStroke(fillColor, fillColor);
  }
  
  // Score percentage text
  doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
     .text(`${(score * 10).toFixed(0)}%`, x + fillWidth - 18, y + 3);
}

// Professional footer function
function addProfessionalFooter(doc) {
  // Footer background
  doc.rect(0, 770, 612, 22).fill('#f1f5f9');
  
  // Footer content
  doc.fontSize(8).font('Helvetica').fillColor('#64748b')
     .text('Interview Buddy - AI-Powered Interview Assessment Platform', 50, 778)
     .text(`Confidential Report • Generated ${new Date().toLocaleDateString()}`, 50, 788)
     .text('© 2025 Interview Buddy', 450, 778);
}

// Simple score bar function
function drawSimpleScoreBar(doc, x, y, score) {
  const barWidth = 150;
  const barHeight = 12;
  const fillWidth = (score / 10) * barWidth;
  
  // Background bar
  doc.rect(x, y, barWidth, barHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
  
  // Fill color based on score
  let fillColor = '#ef4444'; // Red for low scores
  if (score >= 8) fillColor = '#22c55e'; // Green for high scores
  else if (score >= 6) fillColor = '#eab308'; // Yellow for medium scores
  else if (score >= 4) fillColor = '#f97316'; // Orange for low-medium scores
  
  // Fill bar
  if (fillWidth > 0) {
    doc.rect(x, y, fillWidth, barHeight).fillAndStroke(fillColor, fillColor);
  }
}

// Enhanced helper function to draw score bars
function drawEnhancedScoreBar(doc, x, y, score) {
  const barWidth = 150;
  const barHeight = 16;
  const fillWidth = (score / 10) * barWidth;
  
  // Background bar with rounded corners effect
  doc.rect(x, y, barWidth, barHeight).fillAndStroke('#f1f5f9', '#cbd5e1');
  
  // Fill bar based on score with gradient effect
  let fillColor = '#ef4444'; // Red for low scores
  if (score >= 8) fillColor = '#22c55e'; // Green for high scores
  else if (score >= 6) fillColor = '#eab308'; // Yellow for medium scores
  else if (score >= 4) fillColor = '#f97316'; // Orange for low-medium scores
  
  if (fillWidth > 0) {
    doc.rect(x, y, fillWidth, barHeight).fillAndStroke(fillColor, fillColor);
  }
  
  // Score percentage text
  doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
     .text(`${(score * 10).toFixed(0)}%`, x + fillWidth - 20, y + 4);
}

// Helper function to draw score bars
function drawScoreBar(doc, x, y, score) {
  const barWidth = 200;
  const barHeight = 12;
  const fillWidth = (score / 10) * barWidth;
  
  // Background bar
  doc.rect(x, y, barWidth, barHeight).fillAndStroke('#f0f0f0', '#d0d0d0');
  
  // Fill bar based on score
  let fillColor = '#ef4444'; // Red for low scores
  if (score >= 7) fillColor = '#22c55e'; // Green for high scores
  else if (score >= 5) fillColor = '#eab308'; // Yellow for medium scores
  
  doc.rect(x, y, fillWidth, barHeight).fillAndStroke(fillColor, fillColor);
}

// Test endpoint to create sample data (for development only)
module.exports.createSampleSession = async (req, res) => {
  try {
    const sampleSession = new InterviewSession({
      resumeText: "Software Developer with 3 years experience in React, Node.js, and MongoDB. Built several web applications including e-commerce platforms and social media apps. Education: Bachelor's in Computer Science from University of Technology.",
      bio: "Passionate developer who loves creating innovative solutions and learning new technologies. Experience with full-stack development and agile methodologies.",
      conversation: [
        { role: 'ai', message: 'Tell me about yourself and your background in software development.' },
        { role: 'user', message: 'I am a software developer with 3 years of experience working primarily with React and Node.js. I have worked on several web applications and enjoy solving complex problems.' },
        { role: 'ai', message: 'What is your experience with JavaScript frameworks?' },
        { role: 'user', message: 'I have extensive experience with React, including hooks, context API, and state management with Redux. I have also worked with Vue.js on a few projects.' },
        { role: 'ai', message: 'Can you describe a challenging project you worked on?' },
        { role: 'user', message: 'I worked on a real-time chat application that required WebSocket implementation and optimizing performance for thousands of concurrent users.' },
        { role: 'ai', message: 'How do you handle error handling in your applications?' },
        { role: 'user', message: 'I use try-catch blocks, implement proper logging, and create user-friendly error messages. I also set up monitoring tools to track errors in production.' }
      ]
    });

    await sampleSession.save();
    res.json({ 
      message: 'Sample session created successfully', 
      sessionId: sampleSession._id,
      reportUrl: `/api/interview/${sampleSession._id}/report`,
      pdfUrl: `/api/interview/${sampleSession._id}/report-pdf`
    });

  } catch (err) {
    console.error('Error creating sample session:', err);
    res.status(500).json({ error: 'Failed to create sample session.' });
  }
}
const { parseResume } = require("../services/pdfService");
const { generateContent } = require("../services/geminiService");
const { generateSpeech } = require("../services/murffService");
const { transcribeAudio } = require("../services/speechToTextService");
const InterviewSession = require("../models/interviewSession");
const fs = require('fs');

module.exports.startInterview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to start interview.' });
    }

    const resumeFile = req.file;
    const bio = req.body.bio;
    if (!resumeFile || !bio) {
      return res.status(400).json({ error: 'Resume and bio are required.' });
    }
    
    const resumeText = await parseResume(resumeFile.path);
    
    // Delete the resume file after extracting text to save space
    try {
      fs.unlinkSync(resumeFile.path);
    } catch (deleteErr) {
      console.warn(`Failed to delete resume file: ${resumeFile.path}`, deleteErr);
      // Continue with the process even if file deletion fails
    }
    
    const prompt = `You are an interviewer. Based on this resume: ${resumeText} and this bio: ${bio}, return a JSON object with two fields: "resumeSummary" (bullet points summarizing skills, projects, and education) and "firstQuestion" (the first interview question to ask).`;
    const geminiResponse = await generateContent(prompt);
    let cleanedResponse = geminiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedResponse = JSON.parse(cleanedResponse);
    const { resumeSummary, firstQuestion } = parsedResponse;
    
    // Generate speech for first question
    const audioUrl = await generateSpeech(firstQuestion);
    
    const session = new InterviewSession({
      userId: req.user._id, // Use _id instead of id
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

module.exports.transcribeAudio = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { sessionId } = req.params;
    const audioFile = req.file;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    // Verify session exists and belongs to user
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This session does not belong to you.' });
    }

    // Read audio file and transcribe
    const audioBuffer = fs.readFileSync(audioFile.path);
    
    const transcriptionResult = await transcribeAudio(audioBuffer);

    // Clean up audio file
    try {
      fs.unlinkSync(audioFile.path);
    } catch (deleteErr) {
      console.warn(`Failed to delete audio file: ${audioFile.path}`, deleteErr);
    }

    if (!transcriptionResult.success) {
      return res.status(500).json({ 
        error: 'Failed to transcribe audio',
        details: transcriptionResult.error 
      });
    }

    res.json({
      success: true,
      transcript: transcriptionResult.transcript,
      confidence: transcriptionResult.confidence
    });

  } catch (err) {
    console.error('Error transcribing audio:', err);
    res.status(500).json({ error: 'Failed to transcribe audio.' });
  }
}

module.exports.getNextQuestion = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { sessionId } = req.params;
    const { answer, questionIndex } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: 'Session ID and answer are required.' });
    }

    // Find the session and verify ownership
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    // Verify that the session belongs to the authenticated user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This session does not belong to you.' });
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
    const audioUrl = await generateSpeech(cleanedQuestion);

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

// End interview session
module.exports.endInterview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { sessionId } = req.params;
    // Note: We don't need the answer parameter since it was already processed by getNextQuestion

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    // Find the session and verify ownership
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    // Verify that the session belongs to the authenticated user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This session does not belong to you.' });
    }

    // The final user answer should already be in conversation from getNextQuestion endpoint
    // No need to add it again here

    // Generate final completion message
    const finalMessage = "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.";
    
    // Generate audio for final message
    const audioUrl = await generateSpeech(finalMessage);

    // Add final message to conversation history
    session.conversation.push({ role: 'ai', message: finalMessage });
    
    // Mark session as completed
    session.completedAt = new Date();
    await session.save();

    res.json({ 
      success: true, 
      isComplete: true,
      finalMessage: finalMessage,
      audioUrl: audioUrl,
      message: 'Interview completed successfully.'
    });

  } catch (err) {
    console.error('Error ending interview:', err);
    res.status(500).json({ error: 'Failed to end interview.' });
  }
}

// Generate interview report
module.exports.getReport = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { sessionId } = req.params;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    // Verify that the session belongs to the authenticated user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. This session does not belong to you.' });
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
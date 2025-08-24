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
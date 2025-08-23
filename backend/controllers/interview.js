const { parseResume } = require("../services/pdfService");
const { generateContent } = require("../services/geminiService");
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
    const session = new InterviewSession({
      resumeText: resumeSummary.join(' '),
      bio,
      conversation: [{ role: 'ai', message: firstQuestion }],
    });
    await session.save();
    res.json({ sessionId: session._id, firstQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start interview.' });
  }
}
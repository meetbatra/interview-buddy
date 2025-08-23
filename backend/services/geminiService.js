const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


module.exports.generateContent = async(context) => {
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: context,
    });

    return result.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}
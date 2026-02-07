const { createOpenAI} = require("@ai-sdk/openai");
const { generateText } = require("ai");
require('dotenv').config();

const openai = createOpenAI({
  apiKey: process.env.AI_PIPE_KEY,
  baseURL: process.env.AI_PIPE_URL
});


module.exports.generateContent = async(prompt) => {
  try {
    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      prompt
    });

    return result.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}
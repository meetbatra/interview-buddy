const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const apiKey = process.env.MURF_API_KEY;
const baseUrl = 'https://api.murf.ai/v1';

if (!apiKey) {
  console.warn('MURF_API_KEY not found in environment variables');
}

const pollJobStatus = async (jobId) => {
  let audioUrl = null;
  let attempts = 0;
  const maxAttempts = 30;

  while (!audioUrl && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const statusResponse = await axios.get(
        `${baseUrl}/speech/generate/${jobId}`,
        {
          headers: {
            'api-key': apiKey
          }
        }
      );

      if (statusResponse.data.status === 'completed') {
        audioUrl = statusResponse.data.audioFileUrl || statusResponse.data.audioUrl;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error('Speech generation failed');
      }
    } catch (pollError) {
      console.error('Polling error:', pollError.response?.data || pollError.message);
      break;
    }

    attempts++;
  }

  if (!audioUrl) {
    throw new Error('Speech generation timed out');
  }

  return audioUrl;
};

module.exports.generateSpeech = async (text, voiceId = 'en-US-charles') => {
  try {
    if (!apiKey) {
      throw new Error('Murf API key not configured');
    }

    // Create TTS request with correct parameter types
    const response = await axios.post(
      `${baseUrl}/speech/generate`,
      {
        voiceId: voiceId,
        text: text,
        format: 'MP3'
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // If the response contains a direct URL, return it
    if (response.data.audioFile || response.data.audioUrl || response.data.url) {
      const audioUrl = response.data.audioFile || response.data.audioUrl || response.data.url;
      return audioUrl;
    }

    // If it's a job-based response, handle polling
    if (response.data.jobId) {
      return await pollJobStatus(response.data.jobId);
    }

    throw new Error('Unexpected response format from Murf API');

  } catch (error) {
    console.error('Murf TTS Error:', error.response?.data || error.message);
    
    // Fallback: Return null to use Web Speech API
    return null;
  }
};

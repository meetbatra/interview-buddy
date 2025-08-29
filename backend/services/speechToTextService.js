const { createClient } = require('@deepgram/sdk');
require('dotenv').config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

module.exports.transcribeAudio = async (audioBuffer) => {
  try {
    // Configure options using latest nova-3 model with smart formatting
    const options = {
      model: 'nova-3',
      language: 'en-US',
      smart_format: true,
      punctuate: true,
      diarize: false
    };

    // Use the correct API pattern: deepgram.listen.prerecorded.transcribeFile
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      options
    );

    if (error) {
      console.error('Deepgram API error:', error);
      return {
        success: false,
        error: error.message,
        transcript: ''
      };
    }

    // Extract transcript from response structure
    const transcript = result.results.channels[0].alternatives[0].transcript;
    const confidence = result.results.channels[0].alternatives[0].confidence;

    return {
      success: true,
      transcript: transcript,
      confidence: confidence
    };
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return {
      success: false,
      error: error.message,
      transcript: ''
    };
  }
};

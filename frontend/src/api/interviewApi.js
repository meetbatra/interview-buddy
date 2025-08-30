import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/interview`
});

export const startInterview = (resume, bio, token) => {
  const formData = new FormData();
  formData.append('resume', resume);
  formData.append('bio', bio);
  return api.post('/start', formData, {
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - let browser set it for FormData
    }
  });
};

export const transcribeAudio = (sessionId, audioBlob, token) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  return api.post(`/${sessionId}/transcribe`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - let browser set it for FormData
    }
  });
};

export const getNextQuestion = (sessionId, answer, questionIndex, token) => {
  return api.post(`/${sessionId}/next`, {
    answer,
    questionIndex
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const endInterview = (sessionId, token) => {
  return api.post(`/${sessionId}/end`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const getReport = (sessionId, token) => {
  return api.get(`/${sessionId}/report`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
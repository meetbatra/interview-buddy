import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/interview`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const startInterview = (resume, bio, token) => {
  const formData = new FormData();
  formData.append('resume', resume);
  formData.append('bio', bio);
  return api.post('/start', formData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getNextQuestion = (sessionId, answer, questionIndex, token) => {
  return api.post(`/${sessionId}/next`, {
    answer,
    questionIndex
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
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
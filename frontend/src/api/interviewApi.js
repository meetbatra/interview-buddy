import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const startInterview = (resume, bio) => {
  const formData = new FormData();
  formData.append('resume', resume);
  formData.append('bio', bio);
  return api.post('/start', formData);
};
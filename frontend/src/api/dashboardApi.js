import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/dashboard`
});

export const getDashboardOverview = (token) => {
  return api.get('/overview', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getInterviewHistory = (token, page = 1, limit = 10) => {
  return api.get('/history', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params: { page, limit }
  });
};

import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = (email, password) => {
  return api.post('/login', { email, password });
};

export const signup = (username, email, password) => {
  return api.post('/signup', { username, email, password });
};

export const getCurrentUser = (token) => {
  return api.get('/current-user', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const googleLogin = (token) => {
  return api.post('/google', { token });
};
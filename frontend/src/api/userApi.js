import useAuthStore from '../stores/authStore';

const API_BASE_URL = 'http://localhost:8080/api/auth';

export const userApi = {
  // Login user
  login: async (email, password) => {
    const { setLoading, login } = useAuthStore.getState();
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Extract user and token from data.data
        login({ user: data.data.user, token: data.data.token });
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.message };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Register user
  signup: async (username, email, password) => {
    const { setLoading, login } = useAuthStore.getState();
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Extract user and token from data.data
        login({ user: data.data.user, token: data.data.token });
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: data.message };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Get current user (if needed for validation)
  getCurrentUser: async () => {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return { success: true, user: userData.data.user };
      } else {
        return { success: false, error: 'Failed to get user data' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
};

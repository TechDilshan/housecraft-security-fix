
import axios from 'axios';

// Use environment variable for API URL if available, otherwise use localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // This allows credentials (cookies, authorization headers) to be included in requests
  withCredentials: true,
});

// Configure Axios to use XSRF cookie/header names
// Axios will read the XSRF-TOKEN cookie and send it as X-XSRF-TOKEN header automatically
(api.defaults as any).xsrfCookieName = 'XSRF-TOKEN';
(api.defaults as any).xsrfHeaderName = 'X-XSRF-TOKEN';

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Note: Token is now handled automatically by cookies (httpOnly)
    // No need to manually add token to headers
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 error, the token might be expired
    if (error.response && error.response.status === 401) {
      // Log for debugging
      console.log('401 error - token might be expired');
      // We could implement automatic logout here if needed
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`
).replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/`,
  withCredentials: true, // Enable cookies
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1] || 
      localStorage.getItem('access_token') || 
      localStorage.getItem('brd_token') || 
      localStorage.getItem('access') ||
      sessionStorage.getItem('access');
    
    // Debug logging
    console.log('🔍 Token Debug:', {
      cookies: document.cookie,
      tokenFound: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
    });
    
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.warn('❌ No authentication token found');
    }

    // Add CSRF Token for POST/PUT/DELETE requests if SessionAuthentication is used on backend
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers.set("X-CSRFToken", csrfToken);
    }

    config.headers.set("Content-Type", "application/json");
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.warn('❌ API Error:', error.response?.status, error.config?.url);
    if (error.response?.status === 403) {
      console.warn('🔐 403 Forbidden - Check token and user permissions');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
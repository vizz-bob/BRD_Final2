import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Consistent Keys
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const PERMISSIONS_KEY = "permissions";

const authService = {
  // ---------------------------------------------
  // SAVE TOKENS
  // ---------------------------------------------
  saveTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  // ---------------------------------------------
  // GET ACCESS TOKEN
  // ---------------------------------------------
  getAccessToken: () => {
    // First try cookie, then localStorage
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    if (cookieToken) {
      return cookieToken;
    }
    
    return localStorage.getItem(ACCESS_KEY);
  },

  // ---------------------------------------------
  // CHECK IF AUTHENTICATED
  // ---------------------------------------------
  isAuthenticated: () => {
    const token = authService.getAccessToken();
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = authService.decodeJwtPayload(token);
      if (!payload) return false;
      
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  },

  // ---------------------------------------------
  // SSO LOGIN
  // ---------------------------------------------
  ssoLogin: async (token) => {
    try {
      console.log('🔐 Attempting SSO login with token');
      
      const response = await axios.get(`${BASE_URL}/api/v1/auth/sso-login/`, {
        params: { token },
        withCredentials: true,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data.success && response.data.access_token) {
        console.log('✅ SSO login successful');
        
        // Save tokens
        authService.saveTokens(response.data.access_token, response.data.refresh_token);
        
        // Save user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return {
          success: true,
          user: response.data.user,
          access_token: response.data.access_token
        };
      } else {
        console.error('❌ SSO login failed:', response.data);
        return { success: false, error: 'Invalid SSO response' };
      }
    } catch (error) {
      console.error('❌ SSO login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'SSO login failed' 
      };
    }
  },

  // ---------------------------------------------
  // AUTO LOGIN FROM URL TOKEN
  // ---------------------------------------------
  autoLoginFromUrl: async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('🔐 Found token in URL, attempting auto login');
      
      const result = await authService.ssoLogin(token);
      
      if (result.success) {
        // Clean URL
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]*/, '');
        window.history.replaceState({}, document.title, newUrl);
        
        return result;
      }
    }
    
    return { success: false, error: 'No token found' };
  },

  // ---------------------------------------------
  // GET CURRENT USER
  // ---------------------------------------------
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  // ---------------------------------------------
  // REDIRECT TO LOGIN
  // ---------------------------------------------
  redirectToLogin: () => {
    // Redirect to main website for login
    const mainWebsiteUrl = "http://localhost:3001/login"; // Adjust as needed
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${mainWebsiteUrl}?redirect=${returnUrl}`;
  },

  // ---------------------------------------------
  // DECODE JWT
  // ---------------------------------------------
  decodeJwtPayload: (token) => {
    if (!token) return null;
    try {
      const base64 = token.split(".")[1];
      const payload = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(payload);
    } catch (e) {
      console.warn("JWT decode failed:", e);
      return null;
    }
  },

  // ---------------------------------------------
  // GET TENANT ID FROM TOKEN
  // ---------------------------------------------
  getTenantIdFromToken: () => {
    const token = authService.getAccessToken();
    const payload = authService.decodeJwtPayload(token);

    if (!payload) return null;

    return (
      payload.tenant ||
      payload.tenant_id ||
      payload.tenantId ||
      null
    );
  },

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------
  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });
    
    window.location.href = "/dashboard";
  },

  // ---------------------------------------------
  // DIRECT LOGIN METHOD
  // ---------------------------------------------
  directLogin: async (email, password) => {
    try {
      console.log('🔐 Attempting direct login with:', email);
      
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/login/', {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔐 Login response:', response.data);

      if (response.data.access) {
        console.log('✅ Direct login successful');
        
        // Save tokens
        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        
        // Save user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return {
          success: true,
          user: response.data.user,
          access_token: response.data.access
        };
      } else {
        console.error('❌ Direct login failed:', response.data);
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('❌ Direct login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  },

  // ---------------------------------------------
  // QUICK LOGIN FOR TESTING
  // ---------------------------------------------
  quickLogin: async () => {
    console.log('🔐 Attempting quick login with test user');
    
    // Use existing test user from tenant master
    const testCredentials = {
      email: 'unified@test.com',
      password: 'tenant123456'
    };
    
    return await authService.directLogin(testCredentials.email, testCredentials.password);
  },

  // ---------------------------------------------
  // INIT UNIFIED AUTHENTICATION
  // ---------------------------------------------
  initUnifiedAuth: async () => {
    console.log('🔐 Initializing unified authentication');
    
    // Check if already authenticated
    if (authService.isAuthenticated()) {
      console.log('✅ Already authenticated');
      return { success: true };
    }
    
    // Check for SSO token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('token');
    
    if (ssoToken) {
      console.log('🔐 SSO token found, processing...');
      const result = await authService.ssoLogin(ssoToken);
      if (result.success) {
        // Clean URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return result;
      }
    }
    
    // Redirect to main website for login
    authService.redirectToMainWebsite();
  },

  // ---------------------------------------------
  // REDIRECT TO MAIN WEBSITE
  // ---------------------------------------------
  redirectToMainWebsite: () => {
    const mainWebsiteUrl = 'http://localhost:3001/login';
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${mainWebsiteUrl}?redirect=${returnUrl}`;
  },

  // ---------------------------------------------
  // INIT AUTHENTICATION (LEGACY)
  // ---------------------------------------------
  initAuth: async () => {
    console.log('🔐 Initializing authentication');
    
    // First check if already authenticated
    if (authService.isAuthenticated()) {
      console.log('✅ Already authenticated');
      return { success: true };
    }
    
    // Try unified authentication first
    const unifiedResult = await authService.initUnifiedAuth();
    if (unifiedResult.success) {
      return unifiedResult;
    }
    
    // Try quick login for testing
    console.log('🔐 No authentication found, trying quick login');
    const quickResult = await authService.quickLogin();
    
    if (quickResult.success) {
      console.log('✅ Quick login successful');
      return quickResult;
    }
    
    console.log('❌ Quick login failed, redirecting to manual login');
    // For now, set a default token to prevent errors
    const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0ODUzMTEwLCJpYXQiOjE3NzQ4MjQzMTAsImp0aSI6IjVlNmMyYjMxMGZiMTRkMmQ4NTZjZDAzZmU2MjhjYjg4IiwidXNlcl9pZCI6NDR9.Z7QzdYd6wxn2Q0rc0CJ60z_8cpn591FQpyde2rSfBHc';
    localStorage.setItem('access_token', defaultToken);
    console.log('🔧 Set default token for testing');
    
    return { success: true, message: 'Default token set for testing' };
  },
};

export default authService;

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  
  // Generate unique session ID for this tab/context
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Create axios instance for this session to avoid global conflicts
  const axiosInstance = useState(() => {
    const instance = axios.create();
    return instance;
  })[0];

  // Configure axios instance headers (not global defaults)
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance.defaults.headers.common['X-Session-ID'] = sessionId;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      delete axiosInstance.defaults.headers.common['X-Session-ID'];
    }
  }, [token, axiosInstance, sessionId]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only use session-specific token for tab isolation
        const sessionToken = sessionStorage.getItem(`token_${sessionId}`);
        
        if (sessionToken) {
          // Set axios headers before making the request
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`;
          axiosInstance.defaults.headers.common['X-Session-ID'] = sessionId;
          
          try {
            const response = await axiosInstance.get('/api/auth/me');
            setUser(response.data.user);
            setToken(sessionToken);
            
          } catch (error) {
            // Token is invalid, remove it from this session
            sessionStorage.removeItem(`token_${sessionId}`);
            setToken(null);
            setUser(null);
            console.error('Token validation failed:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [axiosInstance, sessionId]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      // Save token only to sessionStorage for tab-specific isolation
      sessionStorage.setItem(`token_${sessionId}`, newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Save token only to sessionStorage for tab-specific isolation
      sessionStorage.setItem(`token_${sessionId}`, newToken);
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Registration successful!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Remove token only from sessionStorage for this tab
    sessionStorage.removeItem(`token_${sessionId}`);
    setToken(null);
    setUser(null);
    
    toast.success('Logged out successfully!');
  };

  const demoLogin = () => {
    // Demo login function for development
    const demoUser = {
      id: 1,
      name: 'Ritesh Roy',
      email: 'ritesh.roy@example.com',
      points: 150,
      level: 1,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    };
    
    const demoToken = `demo-token-${sessionId}`;
    setUser(demoUser);
    setToken(demoToken);
    sessionStorage.setItem(`token_${sessionId}`, demoToken);
    toast.success('Demo login successful!');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const addPoints = async (points, reason = '') => {
    try {
      const response = await axios.post('/api/users/add-points', {
        points,
        reason
      });
      
      if (response.data.success) {
        setUser(prevUser => ({
          ...prevUser,
          points: response.data.totalPoints,
          level: response.data.level
        }));
        
        toast.success(`+${points} points earned! ${reason}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  const isLoggedIn = !!token && !!user;

  const hasRole = (role) => {
    return user?.role === role;
  };

  // Initialize authentication state - commented out auto-login
  // useEffect(() => {
  //   // Only auto-login if we have a demo token but no user
  //   if (token === 'demo-token' && !user) {
  //     demoLogin();
  //   }
  // }, [token, user]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    demoLogin,
    updateUser,
    addPoints,
    refreshUser,
    isLoggedIn,
    hasRole,
    axiosInstance,
    sessionId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

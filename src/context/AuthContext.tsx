
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'>, password: string) => Promise<void>;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for saved token on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Error getting user profile:', error);
          // Don't remove token on error - this prevents logout on page refresh if API is temporarily unavailable
        }
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Login function - removed role parameter
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      
      // Handle role-based redirects
      if (userData.role) {
        switch(userData.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'engineer':
            navigate('/engineer-dashboard');
            break;
          case 'architect':
            navigate('/architect-dashboard');
            break;
          case 'vastu':
            navigate('/vastu-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: Omit<User, 'id'>, password: string) => {
    setLoading(true);
    try {
      const newUser = await authService.register(userData, password);
      setUser(newUser);
      
      // Redirect based on role after signup
      if (newUser.role) {
        switch(newUser.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'engineer':
            navigate('/engineer-dashboard');
            break;
          case 'architect':
            navigate('/architect-dashboard');
            break;
          case 'vastu':
            navigate('/vastu-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  // Update user data function
  const updateUserData = (userData: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...userData
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

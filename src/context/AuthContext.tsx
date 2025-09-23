
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Check for saved token on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Ensure CSRF token cookie exists for subsequent state-changing requests
        try {
          await fetch((import.meta as any).env.VITE_API_URL?.replace(/\/$/, '') + '/auth/csrf-token', {
            credentials: 'include'
          });
        } catch {}
        // Try to get user profile - if successful, user is logged in
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error getting user profile:', error);
        // User is not logged in or token expired
        setUser(null);
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
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
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

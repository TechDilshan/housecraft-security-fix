
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'user@example.com',
    phoneNumber: '123-456-7890',
    role: 'user'
  },
  {
    id: '2',
    fullName: 'Jane Engineer',
    email: 'engineer@example.com',
    phoneNumber: '123-456-7891',
    role: 'engineer',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'B.Tech Civil Engineering'
  },
  {
    id: '3',
    fullName: 'Sam Architect',
    email: 'architect@example.com',
    phoneNumber: '123-456-7892',
    role: 'architect',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'Master of Architecture'
  },
  {
    id: '4',
    fullName: 'Priya Vastu',
    email: 'vastu@example.com',
    phoneNumber: '123-456-7893',
    role: 'vastu',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'Ph.D in Vastu Shastra'
  },
  {
    id: '5',
    fullName: 'Admin User',
    email: 'admin@example.com',
    phoneNumber: '123-456-7894',
    role: 'admin'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved authentication on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email and role
      const foundUser = MOCK_USERS.find(u => u.email === email && u.role === role);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(foundUser));
      setUser(foundUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id'>) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email is already used
      if (MOCK_USERS.some(u => u.email === userData.email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`
      };
      
      // In a real app, you would save this to a database
      MOCK_USERS.push(newUser);
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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

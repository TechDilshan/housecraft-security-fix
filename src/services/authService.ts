
import api from './api';
import { User, UserRole } from '@/types';

// Register new user
export const register = async (userData: Omit<User, 'id'>, password: string) => {
  const response = await api.post('/auth/register', {
    ...userData,
    password
  });
  
  // Save token to localStorage
  localStorage.setItem('token', response.data.token);
  
  return response.data;
};

// Login user
export const login = async (email: string, password: string, role: UserRole) => {
  const response = await api.post('/auth/login', {
    email,
    password,
    role
  });
  
  // Save token to localStorage
  localStorage.setItem('token', response.data.token);
  
  return response.data;
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Logout user (clear token)
export const logout = () => {
  localStorage.removeItem('token');
};

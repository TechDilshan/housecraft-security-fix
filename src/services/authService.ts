
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

// Login user - remove role parameter
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', {
    email,
    password
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

// Update password
export const updatePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.put('/auth/password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

// Delete account
export const deleteUserAccount = async () => {
  const response = await api.delete('/auth/account');
  return response.data;
};

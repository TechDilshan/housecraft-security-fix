
import api from './api';
import { User, UserRole } from '@/types';

// Register new user
export const register = async (userData: Omit<User, 'id'>, password: string) => {
  const response = await api.post('/auth/register', {
    ...userData,
    password
  });
  
  // Token is now automatically set as httpOnly cookie
  return response.data;
};

// Login user - remove role parameter
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  // Token is now automatically set as httpOnly cookie
  return response.data;
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Logout user (clear cookie)
export const logout = async () => {
  await api.post('/auth/logout');
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

// Google OAuth login/signup
export const googleLogin = async (idToken: string) => {
  const response = await api.post('/auth/google', { idToken });
  return response.data;
};

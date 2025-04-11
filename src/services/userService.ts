
import api from './api';
import { User } from '@/types';

// Get professionals by role
export const getProfessionals = async (role: 'engineer' | 'architect' | 'vastu') => {
  const response = await api.get(`/users/professionals/${role}`);
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (updates: Partial<User>) => {
  const response = await api.put('/users/profile', updates);
  return response.data;
};

// Delete user account
export const deleteUser = async () => {
  const response = await api.delete('/users/profile');
  return response.data;
};

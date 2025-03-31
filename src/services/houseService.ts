
import api from './api';
import { House } from '@/types';

// Get all houses with optional filters
export const getHouses = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });
  
  const response = await api.get(`/houses?${params.toString()}`);
  return response.data;
};

// Get house by ID
export const getHouseById = async (id: string) => {
  const response = await api.get(`/houses/${id}`);
  return response.data;
};

// Create new house (admin only)
export const createHouse = async (houseData: Omit<House, 'id'>) => {
  const response = await api.post('/houses', houseData);
  return response.data;
};

// Update house (admin only)
export const updateHouse = async (id: string, updates: Partial<House>) => {
  const response = await api.put(`/houses/${id}`, updates);
  return response.data;
};

// Delete house (admin only)
export const deleteHouse = async (id: string) => {
  const response = await api.delete(`/houses/${id}`);
  return response.data;
};

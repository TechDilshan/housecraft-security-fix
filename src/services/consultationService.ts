
import api from './api';
import { ConsultationRequest, ChatMessage } from '@/types';

// Create consultation request
export const createConsultationRequest = async (
  userId: string,
  professionalId: string,
  consultationType: 'engineer' | 'architect' | 'vastu',
  houseId?: string,
  message?: string
) => {
  const response = await api.post('/consultations', {
    userId,
    professionalId,
    consultationType,
    houseId,
    message
  });
  return response.data;
};

// Get consultation by ID
export const getConsultationById = async (id: string) => {
  const response = await api.get(`/consultations/${id}`);
  return response.data;
};

// Get consultations by current user
export const getConsultationsByUser = async (userId) => {
  const response = await api.get(`/consultations/${userId}`);
  return response.data;
};

// Get consultations by professional
export const getConsultationsByProfessional = async () => {
  const response = await api.get('/consultations/professional/me');
  return response.data;
};

// Add message to consultation
export const addMessageToConsultation = async (
  consultationId: string,
  senderId: string,
  recipientId: string,
  content: string
) => {
  const response = await api.post(`/consultations/${consultationId}/messages`, {
    senderId,
    recipientId,
    content
  });
  return response.data;
};

// Update consultation status
export const updateConsultationStatus = async (
  consultationId: string,
  status: 'pending' | 'accepted' | 'completed' | 'rejected'
) => {
  const response = await api.put(`/consultations/${consultationId}/status`, {
    status
  });
  return response.data;
};

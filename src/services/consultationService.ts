
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
  try {
    console.log('Sending consultation request with data:', {
      professionalId,
      consultationType,
      houseId,
      message
    });
    
    const response = await api.post('/consultations', {
      professionalId,
      consultationType,
      houseId,
      message
    });
    
    console.log('Consultation created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating consultation:', error);
    throw error;
  }
};

// Get consultation by ID
export const getConsultationById = async (_id: string) => {
  try {
    const response = await api.get(`/consultations/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching consultation:', error.response?.data || error.message);
    throw error;
  }
};

// Get consultations by current user
export const getConsultationsByUser = async (userId: string) => {
  try {
    const response = await api.get(`/consultations/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user consultations:', error);
    throw error;
  }
};

// Get consultations by professional
export const getConsultationsByProfessional = async () => {
  try {
    const response = await api.get('/consultations/professional/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching professional consultations:', error);
    throw error;
  }
};

// Add message to consultation (used as a fallback if WebSocket fails)
export const addMessageToConsultation = async (
  consultationId: string,
  senderId: string,
  recipientId: string,
  content: string
) => {
  try {
    const response = await api.post(`/consultations/${consultationId}/messages`, {
      recipientId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

// Update consultation status
export const updateConsultationStatus = async (
  consultationId: string,
  status: 'pending' | 'accepted' | 'completed' | 'rejected'
) => {
  try {
    const response = await api.put(`/consultations/${consultationId}`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating consultation status:', error);
    throw error;
  }
};


import { ConsultationRequest, ChatMessage, UserRole } from '@/types';

// Mock consultation requests for the demo
const CONSULTATION_REQUESTS: ConsultationRequest[] = [
  {
    id: '1',
    userId: '1',
    professionalId: '2',
    houseId: '3',
    requestType: 'engineer',
    status: 'pending',
    messages: [
      {
        id: 'm1',
        senderId: '1',
        recipientId: '2',
        content: 'Hello, I\'m interested in building a similar house to the one that was sold. Can you help?',
        timestamp: new Date('2023-09-15T10:00:00')
      }
    ],
    createdAt: new Date('2023-09-15T10:00:00')
  },
  {
    id: '2',
    userId: '1',
    professionalId: '3',
    requestType: 'architect',
    status: 'accepted',
    messages: [
      {
        id: 'm2',
        senderId: '1',
        recipientId: '3',
        content: 'I need help with designing a custom house. Are you available?',
        timestamp: new Date('2023-09-10T14:30:00')
      },
      {
        id: 'm3',
        senderId: '3',
        recipientId: '1',
        content: 'Yes, I\'d be happy to help! What kind of design are you looking for?',
        timestamp: new Date('2023-09-10T15:00:00')
      }
    ],
    createdAt: new Date('2023-09-10T14:30:00')
  },
  {
    id: '3',
    userId: '1',
    professionalId: '4',
    houseId: '1',
    requestType: 'vastu',
    status: 'completed',
    messages: [
      {
        id: 'm4',
        senderId: '1',
        recipientId: '4',
        content: 'Could you provide some vastu advice for the house I\'m interested in?',
        timestamp: new Date('2023-09-05T09:15:00')
      },
      {
        id: 'm5',
        senderId: '4',
        recipientId: '1',
        content: 'Of course! I\'ve reviewed the plans and have some recommendations for you.',
        timestamp: new Date('2023-09-05T10:00:00')
      },
      {
        id: 'm6',
        senderId: '1',
        recipientId: '4',
        content: 'Thank you! That\'s very helpful.',
        timestamp: new Date('2023-09-05T10:30:00')
      }
    ],
    createdAt: new Date('2023-09-05T09:15:00')
  }
];

export const createConsultationRequest = async (
  userId: string,
  professionalId: string,
  requestType: 'engineer' | 'architect' | 'vastu',
  houseId?: string,
  initialMessage?: string
) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const messages: ChatMessage[] = [];
  
  if (initialMessage) {
    messages.push({
      id: `msg-${Date.now()}`,
      senderId: userId,
      recipientId: professionalId,
      content: initialMessage,
      timestamp: new Date()
    });
  }
  
  const newRequest: ConsultationRequest = {
    id: `req-${Date.now()}`,
    userId,
    professionalId,
    houseId,
    requestType,
    status: 'pending',
    messages,
    createdAt: new Date()
  };
  
  CONSULTATION_REQUESTS.push(newRequest);
  
  return newRequest;
};

export const getConsultationsByUser = async (userId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return CONSULTATION_REQUESTS.filter(request => request.userId === userId);
};

export const getConsultationsByProfessional = async (professionalId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return CONSULTATION_REQUESTS.filter(request => request.professionalId === professionalId);
};

export const getConsultationById = async (id: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const consultation = CONSULTATION_REQUESTS.find(request => request.id === id);
  
  if (!consultation) {
    throw new Error('Consultation request not found');
  }
  
  return consultation;
};

export const addMessageToConsultation = async (
  consultationId: string,
  senderId: string,
  recipientId: string,
  content: string
) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const consultationIndex = CONSULTATION_REQUESTS.findIndex(
    request => request.id === consultationId
  );
  
  if (consultationIndex === -1) {
    throw new Error('Consultation request not found');
  }
  
  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    senderId,
    recipientId,
    content,
    timestamp: new Date()
  };
  
  CONSULTATION_REQUESTS[consultationIndex].messages.push(newMessage);
  
  return newMessage;
};

export const updateConsultationStatus = async (
  consultationId: string,
  status: 'pending' | 'accepted' | 'completed'
) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const consultationIndex = CONSULTATION_REQUESTS.findIndex(
    request => request.id === consultationId
  );
  
  if (consultationIndex === -1) {
    throw new Error('Consultation request not found');
  }
  
  CONSULTATION_REQUESTS[consultationIndex].status = status;
  
  return CONSULTATION_REQUESTS[consultationIndex];
};

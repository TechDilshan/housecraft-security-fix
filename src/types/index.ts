export type UserRole = 'user' | 'engineer' | 'architect' | 'vastu' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profileImage?: string;
  degree?: string;
  _password?: string; // Added password property with optional modifier
}

export interface House {
  id: string;
  images: string[];
  title: string;
  description: string;
  houseType: 'single' | 'two' | 'three' | 'box';
  location: string;
  price: number;
  available: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
}

export interface ConsultationRequest {
  id: string;
  userId: string;
  professionalId: string;
  houseId?: string;
  requestType: 'engineer' | 'architect' | 'vastu';
  status: 'pending' | 'accepted' | 'completed';
  messages: ChatMessage[];
  createdAt: Date;
}

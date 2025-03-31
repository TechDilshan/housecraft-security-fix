
// User types
export type UserRole = 'user' | 'admin' | 'engineer' | 'architect' | 'vastu';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profileImage?: string;
  degree?: string;
}

// House types
export type HouseType = 'single' | 'two' | 'three' | 'box';

export interface House {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  houseType: HouseType;
  images: string[];
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Consultation types
export type ConsultationType = 'engineer' | 'architect' | 'vastu';
export type ConsultationStatus = 'pending' | 'accepted' | 'completed' | 'rejected';

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

export interface ConsultationRequest {
  id: string;
  userId: string;
  professionalId: string;
  consultationType: ConsultationType;
  houseId?: string;
  status: ConsultationStatus;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

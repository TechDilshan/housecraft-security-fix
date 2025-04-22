
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { ConsultationRequest, User, ChatMessage } from '@/types';
import { getConsultationById } from '@/services/consultationService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PROFESSIONALS: Record<string, User> = {
  '2': {
    _id: '67ea87cba997d4c45941c2a8',
    fullName: 'Jane Engineer',
    email: 'engineer@example.com',
    phoneNumber: '123-456-7891',
    role: 'engineer',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'B.Tech Civil Engineering',
  },
  '3': {
    _id: '67f80eaa718e333f999c7904',
    fullName: 'Sam Architect',
    email: 'architect@example.com',
    phoneNumber: '123-456-7892',
    role: 'architect',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'Master of Architecture',
  },
  '4': {
    _id: '67f8106d718e333f999c7b0e',
    fullName: 'Priya Vastu',
    email: 'vastu@example.com',
    phoneNumber: '123-456-7893',
    role: 'vastu',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'Ph.D in Vastu Shastra',
  },
};

// Default user data to ensure required fields for User type are present
const DEFAULT_USER_DATA: Partial<User> = {
  email: '',
  phoneNumber: '',
  profileImage: '',
};

const ChatPage = () => {
  const { _id } = useParams<{ _id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { joinChat, leaveChat } = useSocket();

  const [consultation, setConsultation] = useState<ConsultationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the consultation data initially
  const fetchConsultation = async () => {
    try {
      const consultationData = await getConsultationById(_id);
      setConsultation(consultationData);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: 'Error',
        description: 'Could not load chat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchConsultation();
    
    // No need for interval polling with WebSockets
  }, [_id, user, navigate]);
  
  // Join the chat room when consultation data is loaded
  useEffect(() => {
    if (consultation && _id) {
      joinChat(_id);
      
      // Leave the room when component unmounts
      return () => {
        leaveChat(_id);
      };
    }
  }, [consultation, _id, joinChat, leaveChat]);
  
  // Handle receiving a new message via WebSocket
  const handleNewMessage = (message: ChatMessage) => {
    setConsultation((prev) => {
      if (!prev) return null;
      
      // Add the new message to the messages array
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl animate-pulse">
            <div className="h-[600px] bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Conversation Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The conversation you're looking for does not exist or has been removed.
            </p>
            <Link to="/my-requests">
              <Button>Back to My Requests</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract professional and user info correctly
  const professional = 
    typeof consultation.professionalId === 'string'
      ? PROFESSIONALS[consultation.professionalId]
      : consultation.professionalId;

  // Create a complete User object for the client with all required properties
  const client: User = typeof consultation.userId === 'string'
    ? {
        _id: consultation.userId,
        fullName: 'Client',
        role: 'user',
        email: '',
        phoneNumber: '',
        ...DEFAULT_USER_DATA,
      }
    : consultation.userId;
  
  const returnPath = user.role === 'user' ? '/my-requests' : `/${user.role}-dashboard`;

  const sortedMessages = Array.isArray(consultation.messages)
    ? [...consultation.messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : [];

  // Determine which details to show based on current user role
  const showProfessionalDetails = user.role === 'user';
  const otherParty = user.role === 'user' ? professional : client;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container max-w-4xl">
          <div className="mb-6">
            <Link to={returnPath} className="inline-flex items-center text-accent hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {user.role === 'user' ? 'Back to My Requests' : 'Back to Dashboard'}
            </Link>
          </div>

          {showProfessionalDetails && professional && (
            <Card className="mt-8 shadow-sm">
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>
                  Information about your consultant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={professional.profileImage} />
                    <AvatarFallback className="text-lg">{professional.fullName?.substring(0, 2) || 'PR'}</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium">{professional.fullName}</h3>
                      <p className="text-muted-foreground capitalize">{professional?.role || 'Professional'}</p>
                    </div>
                    
                    {professional?.email && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-muted-foreground">{professional.email}</p>
                      </div>
                    )}
                    
                    {professional?.degree && (
                      <div>
                        <p className="text-sm font-medium">Qualifications</p>
                        <p className="text-muted-foreground">{professional.degree}</p>
                      </div>
                    )}
                    
                    {professional?.phoneNumber && (
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-muted-foreground">{professional.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!showProfessionalDetails && client && (
            <Card className="mt-8 shadow-sm">
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
                <CardDescription>
                  Information about the client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={client.profileImage} />
                    <AvatarFallback className="text-lg">{client.fullName?.substring(0, 2) || 'CL'}</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium">{client.fullName}</h3>
                      <p className="text-muted-foreground">Client</p>
                    </div>
                    
                    {client?.email && (
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-muted-foreground">{client.email}</p>
                      </div>
                    )}
                    
                    {client?.phoneNumber && (
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-muted-foreground">{client.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <ChatInterface
            consultationId={_id}
            messages={sortedMessages}
            currentUser={user}
            professional={professional}
            onNewMessage={handleNewMessage}
            otherUser={client}
          />
          
        </div>
      </main>

      <footer className="bg-estate-950 text-white py-6">
        <div className="container text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} EstateCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;

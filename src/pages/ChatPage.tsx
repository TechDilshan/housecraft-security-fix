import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { useAuth } from '@/context/AuthContext';
import { ConsultationRequest, User } from '@/types';
import { getConsultationById, addMessageToConsultation } from '@/services/consultationService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const ChatPage = () => {
  const { _id } = useParams<{ _id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Use navigate instead of Navigate component

  const [consultation, setConsultation] = useState<ConsultationRequest | null>(null);
  const [loading, setLoading] = useState(true);

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
      navigate('/login'); // Redirect to login page if user is not authenticated
      return;
    }

    fetchConsultation();
    const interval = setInterval(fetchConsultation, 5000);

    return () => clearInterval(interval);
  }, [_id, user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   if (!loading && consultation && user) {
  //     if (consultation.userId !== user._id && consultation.professionalId !== user._id) {
  //       navigate('/my-requests'); // Redirect if user is not part of the chat
  //     }
  //   }
  // }, [consultation, user, loading, navigate]);

  const handleSendMessage = async (content: string) => {
    if (!user || !consultation) return;

    try {
      const recipientId =
        user._id === consultation.userId ? consultation.professionalId : consultation.userId;

      const newMessage = await addMessageToConsultation(
        consultation._id,
        user._id,
        recipientId,
        content
      );

      setConsultation((prev) => prev && { ...prev, messages: [...(prev.messages || []), newMessage] });

      setTimeout(fetchConsultation, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message',
        variant: 'destructive',
      });
    }
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

  // Ensure professional exists before passing to ChatInterface
  const professional = 
  typeof consultation.professionalId === 'string'
    ? JSON.parse(consultation.professionalId) 
    : consultation.professionalId;



  // If professional is not found, you can pass a fallback or empty object
  const professionalImage = professional ? professional.profileImage : '';
  const professionalName = professional ? professional.fullName : 'Unknown Professional';

  const returnPath = user.role === 'user' ? '/my-requests' : `/${user.role}-dashboard`;

  const sortedMessages = Array.isArray(consultation.messages)
    ? [...consultation.messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    : []; // Ensure it's an array before attempting to sort

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

          <ChatInterface
            messages={sortedMessages}
            currentUser={user}
            professional={{
              fullName: professionalName,
              profileImage: professionalImage,
              ...professional, // Spread the rest of the data (safety)
            }}
            onSendMessage={handleSendMessage}
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

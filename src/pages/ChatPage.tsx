
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getConsultationById, addMessageToConsultation, updateConsultationStatus } from '@/services/consultationService';
import { getUserById } from '@/services/userService';
import ChatInterface from '@/components/ChatInterface';
import ProfessionalDetails from '@/components/ProfessionalDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { User, ConsultationRequest } from '@/types';

const ChatPage = () => {
  const { _id } = useParams<{ _id: string }>();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationRequest | null>(null);
  const [professional, setProfessional] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!_id || !user) return;
    
    const loadConsultation = async () => {
      try {
        setLoading(true);
        
        const consultationData = await getConsultationById(_id);
        setConsultation(consultationData);
        
        // Fetch professional details
        let professionalId;
        if (user.role === 'user') {
          professionalId = consultationData.professionalId;
        } else {
          professionalId = consultationData.userId;
        }
        
        const professionalData = await getUserById(professionalId);
        setProfessional(professionalData);
        
      } catch (err) {
        console.error('Error loading consultation:', err);
        setError('Failed to load consultation');
      } finally {
        setLoading(false);
      }
    };
    
    loadConsultation();
  }, [_id, user]);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const handleSendMessage = async (content: string) => {
    if (!consultation || !user) return;
    
    try {
      // Determine recipient ID based on user role
      const recipientId = user.role === 'user' 
        ? consultation.professionalId 
        : consultation.userId;
      
      const updatedConsultation = await addMessageToConsultation(
        consultation._id,
        user._id,
        recipientId,
        content
      );
      
      setConsultation(updatedConsultation);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  const handleStatusChange = async (status: 'accepted' | 'completed' | 'rejected') => {
    if (!consultation) return;
    
    try {
      const updatedConsultation = await updateConsultationStatus(consultation._id, status);
      setConsultation(updatedConsultation);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
  // Determine the correct return link based on user role
  const getReturnLink = () => {
    if (!user) return '/login';
    
    if (user.role === 'user') {
      return '/my-requests';
    } else if (user.role === 'admin') {
      return '/admin';
    } else {
      return `/${user.role}-dashboard`;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container max-w-4xl">
          <div className="mb-6">
            <Link to={getReturnLink()} className="inline-flex items-center text-accent hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
          
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <p>Loading chat...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : consultation ? (
            <div>
              <ChatInterface
                messages={consultation.messages}
                onSendMessage={handleSendMessage}
                consultation={consultation}
                currentUser={user}
                onStatusChange={handleStatusChange}
              />
              
              {/* Show professional details for users, or client details for professionals */}
              {professional && (
                <ProfessionalDetails professional={professional} />
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Consultation not found</h3>
              <p className="text-muted-foreground">
                The requested consultation could not be found.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-estate-950 text-white py-6 mt-auto">
        <div className="container text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} EstateCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;

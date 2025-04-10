
import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { ConsultationRequest, User, UserRole } from '@/types';
import { getConsultationsByProfessional, updateConsultationStatus } from '@/services/consultationService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock user data for the demo
const USERS: Record<string, User> = {
  '1': {
    _id: '1',
    fullName: 'John Doe',
    email: 'user@example.com',
    phoneNumber: '123-456-7890',
    role: 'user',
  }
};

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchRequests = async () => {
      try {
        const professionalRequests = await getConsultationsByProfessional();
        setRequests(professionalRequests);
      } catch (error) {
        console.error('Error fetching consultation requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user]);
  
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const updatedRequest = await updateConsultationStatus(requestId, 'accepted');
      
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        )
      );
      
      toast({
        title: 'Request Accepted',
        description: 'You have accepted the consultation request',
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Could not accept the request',
        variant: 'destructive',
      });
    }
  };
  
  const handleCompleteRequest = async (requestId: string) => {
    try {
      const updatedRequest = await updateConsultationStatus(requestId, 'completed');
      
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        )
      );
      
      toast({
        title: 'Request Completed',
        description: 'You have marked the consultation as completed',
      });
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: 'Error',
        description: 'Could not complete the request',
        variant: 'destructive',
      });
    }
  };
  
  if (!user || !['engineer', 'architect', 'vastu'].includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const activeRequests = requests.filter(req => req.status === 'accepted');
  const completedRequests = requests.filter(req => req.status === 'completed');
  
  const getDashboardTitle = (role: UserRole) => {
    switch (role) {
      case 'engineer':
        return 'Engineer Dashboard';
      case 'architect':
        return 'Architect Dashboard';
      case 'vastu':
        return 'Vastu Consultant Dashboard';
      default:
        return 'Professional Dashboard';
    }
  };
  
  const RequestList = ({ requests, showAcceptButton = false, showCompleteButton = false }: { 
    requests: ConsultationRequest[],
    showAcceptButton?: boolean,
    showCompleteButton?: boolean
  }) => (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No consultation requests found in this category.</p>
      ) : (
        requests.map(request => (
          <Card key={request._id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {USERS[request.userId]?.fullName.substring(0, 2) || 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {USERS[request.userId]?.fullName || 'Client'}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary capitalize">
                  {request.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {request.messages[0]?.content || 'No message content'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/chat/${request._id}`} className="flex-1">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View Conversation
                  </Button>
                </Link>
                
                {showAcceptButton && (
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleAcceptRequest(request._id)}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                )}
                
                {showCompleteButton && (
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleCompleteRequest(request._id)}
                  >
                    <Check className="h-4 w-4" />
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <h1 className="text-3xl font-serif mb-8">{getDashboardTitle(user.role)}</h1>
          
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedRequests.length})
              </TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((_, index) => (
                  <div key={index} className="h-40 bg-card animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="pending">
                  <RequestList requests={pendingRequests} showAcceptButton />
                </TabsContent>
                <TabsContent value="active">
                  <RequestList requests={activeRequests} showCompleteButton />
                </TabsContent>
                <TabsContent value="completed">
                  <RequestList requests={completedRequests} />
                </TabsContent>
              </>
            )}
          </Tabs>
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

export default ProfessionalDashboard;

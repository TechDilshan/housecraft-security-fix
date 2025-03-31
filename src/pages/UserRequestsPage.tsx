import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { ConsultationRequest, User } from '@/types';
import { getConsultationsByUser } from '@/services/consultationService';
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
import { MessageSquare } from 'lucide-react';

const PROFESSIONALS: Record<string, User> = {
  '2': {
    _id: '67ea87cba997d4c45941c2a8',
    fullName: 'Jane Engineer',
    email: 'engineer@example.com',
    phoneNumber: '123-456-7891',
    role: 'engineer',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'B.Tech Civil Engineering'
  },
  '3': {
    _id: '3',
    fullName: 'Sam Architect',
    email: 'architect@example.com',
    phoneNumber: '123-456-7892',
    role: 'architect',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'Master of Architecture'
  },
  '4': {
    _id: '4',
    fullName: 'Priya Vastu',
    email: 'vastu@example.com',
    phoneNumber: '123-456-7893',
    role: 'vastu',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    degree: 'Ph.D in Vastu Shastra'
  },
};

const UserRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchRequests = async () => {
      try {
        const userRequests = await getConsultationsByUser(user._id);
        setRequests(userRequests);
      } catch (error) {
        console.error('Error fetching consultation requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
    
    const interval = setInterval(fetchRequests, 10000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const activeRequests = requests.filter(req => req.status === 'accepted');
  const completedRequests = requests.filter(req => req.status === 'completed');
  
  const RequestList = ({ requests }: { requests: ConsultationRequest[] }) => (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No consultation requests found in this category.</p>
      ) : (
        requests.map(request => {
          const sortedMessages = [...request.messages].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
          });
          
          const latestMessage = sortedMessages.length > 0 
            ? sortedMessages[sortedMessages.length - 1] 
            : null;
            
          const isFromProfessional = latestMessage && latestMessage.senderId === request.professionalId;
          
          return (
            <Card key={request._id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={PROFESSIONALS[request.professionalId]?.profileImage} />
                      <AvatarFallback>
                        {PROFESSIONALS[request.professionalId]?.fullName.substring(0, 2) || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {PROFESSIONALS[request.professionalId]?.fullName || 'Professional'}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {PROFESSIONALS[request.professionalId]?.role || request.consultationType}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {latestMessage ? (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          {isFromProfessional ? (
                            <>
                              <AvatarImage src={PROFESSIONALS[request.professionalId]?.profileImage} />
                              <AvatarFallback>
                                {PROFESSIONALS[request.professionalId]?.fullName.substring(0, 2) || 'P'}
                              </AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback>You</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-xs font-medium">
                          {isFromProfessional ? 
                            `${PROFESSIONALS[request.professionalId]?.fullName}:` : 
                            'You:'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(latestMessage.timestamp), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {latestMessage.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No messages in this conversation yet.</p>
                  )}
                </div>
                <Link to={`/chat/${request._id}`}>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View Conversation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <h1 className="text-3xl font-serif mb-8">My Consultation Requests</h1>
          
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
                  <RequestList requests={pendingRequests} />
                </TabsContent>
                <TabsContent value="active">
                  <RequestList requests={activeRequests} />
                </TabsContent>
                <TabsContent value="completed">
                  <RequestList requests={completedRequests} />
                </TabsContent>
              </>
            )}
          </Tabs>
          
          <div className="flex justify-center mt-10">
            <Link to="/houses">
              <Button variant="outline">Browse More Houses</Button>
            </Link>
          </div>
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

export default UserRequestsPage;

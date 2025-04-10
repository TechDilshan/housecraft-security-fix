import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { House, User } from '@/types';
import { getHouseById } from '@/services/houseService';
import { createConsultationRequest } from '@/services/consultationService';
import HouseCarousel from '@/components/HouseCarousel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

const HouseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [consultationType, setConsultationType] = useState('engineer');
  const [submitting, setSubmitting] = useState(false);
  
  // Mock professionals for the demo
  const professionals: Record<string, User> = {
    engineer: {
      _id: '67ea87cba997d4c45941c2a8',
      fullName: 'Jane Engineer',
      email: 'engineer@example.com',
      phoneNumber: '123-456-7891',
      role: 'engineer',
    },
    architect: {
      _id: '67f80eaa718e333f999c7904',
      fullName: 'Sam Architect',
      email: 'architect@example.com',
      phoneNumber: '123-456-7892',
      role: 'architect',
    },
    vastu: {
      _id: '67f8106d718e333f999c7b0e',
      fullName: 'Priya Vastu',
      email: 'vastu@example.com',
      phoneNumber: '123-456-7893',
      role: 'vastu',
    },
  };
  
  useEffect(() => {
    if (!id) return;
    
    const fetchHouse = async () => {
      try {
        const houseData = await getHouseById(id);
        setHouse(houseData);
      } catch (error) {
        console.error('Error fetching house:', error);
        toast({
          title: 'Error',
          description: 'Could not load house details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHouse();
  }, [id, toast]);

  const handleRequestConsultation = async () => {
    if (!user || !house) return;
    
    setSubmitting(true);
    
    try {
      const professionalId = professionals[consultationType]._id;
      
      await createConsultationRequest(
        user._id,
        professionalId,
        consultationType as any,
        house._id,
        message
      );
      
      setOpen(false);
      
      toast({
        title: 'Request Sent',
        description: `Your consultation request has been sent to our ${consultationType}`,
      });
      
      navigate('/my-requests');
    } catch (error) {
      console.error('Error creating consultation request:', error);
      toast({
        title: 'Error',
        description: 'Could not send consultation request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactProfessional = async (type: 'engineer' | 'architect' | 'vastu') => {
    if (!user || !house) return;
    
    setSubmitting(true);
    
    try {
      const professionalId = professionals[type]._id;
      const initialMessage = `Hello, I'm interested in discussing the "${house.title}" in ${house.location}`;
      
      // Log the values being sent
      console.log('Request data:', {
        userId: user._id,
        professionalId,
        type,
        houseId: house._id,
        message: initialMessage
      });
      
      const consultationRequest = await createConsultationRequest(
        user._id,
        professionalId,
        type,
        house._id,
        initialMessage
      );
      
      toast({
        title: 'Chat Started',
        description: `You are now connected with our ${type}`,
      });
      
      // Navigate to the chat page with the new consultation ID
      navigate(`/chat/${consultationRequest._id}`);
    } catch (error) {
      console.error('Error creating consultation chat:', error);
      // Log the full error object
      console.log('Full error:', error);
      toast({
        title: 'Error',
        description: 'Could not connect with professional',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle direct contact with agent (for available houses)
  const handleContactAgent = () => {
    if (!user || !house) return;
    
    toast({
      title: 'Agent Contacted',
      description: 'Our agent will contact you shortly about this property.',
    });
  };
  
  // Handle house request (for available houses)
  const handleRequestHouse = () => {
    if (!user || !house) return;
    
    toast({
      title: 'House Requested',
      description: 'Your request for this house has been submitted successfully!',
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl animate-pulse">
            <div className="h-80 bg-muted rounded-lg mb-8" />
            <div className="h-12 bg-muted rounded-lg w-1/2 mb-4" />
            <div className="h-6 bg-muted rounded-lg w-1/4 mb-8" />
            <div className="h-40 bg-muted rounded-lg mb-8" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!house) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">House Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The house you're looking for does not exist or has been removed.
            </p>
            <Link to="/houses">
              <Button>Back to Houses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <div className="mb-8">
            <Link to="/houses" className="text-accent hover:underline">
              ← Back to Houses
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HouseCarousel images={house.images} title={house.title} />
              
              <div className="mt-8">
                <h1 className="text-3xl font-serif mb-2">{house.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{house.location}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {house.houseType === 'single' && 'Single Story'}
                    {house.houseType === 'two' && 'Two Story'}
                    {house.houseType === 'three' && 'Three Story'}
                    {house.houseType === 'box' && 'Box Style'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    house.available 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {house.available ? 'Available' : 'Sold'}
                  </span>
                </div>
                
                <div className="prose max-w-none mb-8">
                  <h2 className="text-xl font-medium mb-2">Description</h2>
                  <p className="text-muted-foreground">{house.description}</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow-sm p-6 sticky top-8">
                <div className="text-3xl font-semibold mb-6 text-estate-950">
                  {formatCurrency(house.price)}
                </div>
                
                {house.available ? (
                  <>
                    {user && user.role === 'user' && (
                      <Button className="w-full mb-4" size="lg" onClick={handleRequestHouse}>
                        Request This House
                      </Button>
                    )}
                    {/* <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleContactAgent}
                      disabled={!user}
                    >
                      Contact Agent
                    </Button> */}
                  </>
                ) : (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mb-4" size="lg">
                        Request Similar House
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request a Similar House</DialogTitle>
                        <DialogDescription>
                          This property is already sold, but our professionals can help you build a similar one.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Consultation Type
                          </label>
                          <Select 
                            onValueChange={setConsultationType} 
                            defaultValue={consultationType}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select professional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="engineer">Engineer</SelectItem>
                              <SelectItem value="architect">Architect</SelectItem>
                              <SelectItem value="vastu">Vastu Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Your Message
                          </label>
                          <Textarea
                            placeholder="Describe what you're looking for..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={handleRequestConsultation} 
                          disabled={!user || submitting}
                        >
                          {submitting ? 'Sending...' : 'Send Request'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleContactProfessional('engineer')}
                    disabled={!user || submitting}
                  >
                    {submitting ? 'Connecting...' : 'Consult Engineer'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleContactProfessional('architect')}
                    disabled={!user || submitting}
                  >
                    {submitting ? 'Connecting...' : 'Consult Architect'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleContactProfessional('vastu')}
                    disabled={!user || submitting}
                  >
                    {submitting ? 'Connecting...' : 'Vastu Consultation'}
                  </Button>
                  
                  {!user && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Please <Link to="/login" className="text-accent">log in</Link> to request consultations
                    </p>
                  )}
                </div>
              </div>
            </div>
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

export default HouseDetailPage;

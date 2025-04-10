import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { House, User } from '@/types';
import { getHouseById, createHouseRequest } from '@/services/houseService';
import { createConsultationRequest } from '@/services/consultationService';
import HouseCarousel from '@/components/HouseCarousel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getProfessionals } from '@/services/userService';
import { formatCurrency } from '@/lib/utils';
import {
  CalendarClock,
  HomeIcon,
  MapPin,
  DollarSign,
  Check,
  ArrowLeft,
  Users,
} from 'lucide-react';
import ProfessionalCard from '@/components/ProfessionalCard';

const HouseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [architects, setArchitects] = useState<User[]>([]);
  const [vastuExperts, setVastuExperts] = useState<User[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [consultationType, setConsultationType] = useState<'engineer' | 'architect' | 'vastu'>('engineer');
  
  // Fetch house data
  useEffect(() => {
    if (!id) return;
    
    const fetchHouse = async () => {
      try {
        const data = await getHouseById(id);
        setHouse(data);
      } catch (error) {
        console.error('Error fetching house:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch house details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHouse();
  }, [id, toast]);
  
  // Fetch professionals
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoadingProfessionals(true);
        
        const [engineerList, architectList, vastuList] = await Promise.all([
          getProfessionals('engineer'),
          getProfessionals('architect'),
          getProfessionals('vastu'),
        ]);
        
        setEngineers(engineerList);
        setArchitects(architectList);
        setVastuExperts(vastuList);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoadingProfessionals(false);
      }
    };
    
    fetchProfessionals();
  }, []);
  
  // Request house
  const handleRequestHouse = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!house) return;
    
    try {
      setRequesting(true);
      await createHouseRequest(house._id);
      
      toast({
        title: 'Request Sent',
        description: 'Your house request has been submitted successfully',
      });
    } catch (error) {
      console.error('Error requesting house:', error);
      toast({
        title: 'Error',
        description: 'Could not submit your request',
        variant: 'destructive',
      });
    } finally {
      setRequesting(false);
    }
  };
  
  // Request consultation
  const handleRequestConsultation = async (professionalId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!house) return;
    
    try {
      const consultation = await createConsultationRequest(
        user._id,
        professionalId,
        consultationType,
        house._id
      );
      
      toast({
        title: 'Consultation Requested',
        description: 'Your consultation request has been sent',
      });
      
      navigate(`/chat/${consultation._id}`);
    } catch (error) {
      console.error('Error requesting consultation:', error);
      toast({
        title: 'Error',
        description: 'Could not request consultation',
        variant: 'destructive',
      });
    }
  };
  
  // Show appropriate professionals based on selected consultation type
  const getProfessionalsByType = () => {
    switch (consultationType) {
      case 'engineer':
        return engineers;
      case 'architect':
        return architects;
      case 'vastu':
        return vastuExperts;
      default:
        return [];
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container">
            <div className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-1/2 mb-8"></div>
              <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!house) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container text-center">
            <h1 className="text-2xl font-medium mb-4">House Not Found</h1>
            <p className="mb-8">The house you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/houses">Browse All Houses</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <div className="mb-6">
            <Link to="/houses" className="inline-flex items-center text-accent hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Houses
            </Link>
          </div>
          
          {/* House Images */}
          <div className="mb-8">
            <HouseCarousel images={house.images} />
          </div>
          
          {/* House Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-serif mb-2">{house.title}</h1>
              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{house.location}</span>
              </div>
              
              <div className="prose max-w-none mb-8">
                <p>{house.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center">
                  <HomeIcon className="h-5 w-5 mb-2 text-primary" />
                  <span className="text-sm text-center">
                    {house.houseType === 'single' && 'Single Story'}
                    {house.houseType === 'two' && 'Two Story'}
                    {house.houseType === 'three' && 'Three Story'}
                    {house.houseType === 'box' && 'Box Style'}
                  </span>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center">
                  <CalendarClock className="h-5 w-5 mb-2 text-primary" />
                  <span className="text-sm text-center">
                    {house.available ? 'Available' : 'Sold'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Price</span>
                    <span className="text-primary">{formatCurrency(house.price)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {house.available ? (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={handleRequestHouse}
                        disabled={requesting}
                      >
                        {requesting ? 'Sending Request...' : 'Request This House'}
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        Submit your interest in this property
                      </p>
                    </>
                  ) : (
                    <div className="text-center p-4 border rounded-lg bg-red-50">
                      <p className="font-medium text-red-600">This house is no longer available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Consultation Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Consult a Professional</CardTitle>
              <CardDescription>
                Get expert advice on this property from our professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex space-x-2 mb-6">
                  <Button 
                    onClick={() => setConsultationType('engineer')}
                    variant={consultationType === 'engineer' ? 'default' : 'outline'}
                  >
                    Engineers
                  </Button>
                  <Button 
                    onClick={() => setConsultationType('architect')}
                    variant={consultationType === 'architect' ? 'default' : 'outline'}
                  >
                    Architects
                  </Button>
                  <Button 
                    onClick={() => setConsultationType('vastu')}
                    variant={consultationType === 'vastu' ? 'default' : 'outline'}
                  >
                    Vastu Experts
                  </Button>
                </div>
                
                {loadingProfessionals ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="h-48 bg-card animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getProfessionalsByType().length === 0 ? (
                      <div className="col-span-full text-center py-10">
                        <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium mb-1">No Professionals Available</h3>
                        <p className="text-muted-foreground">
                          There are currently no {consultationType}s available. Please check back later.
                        </p>
                      </div>
                    ) : (
                      getProfessionalsByType().map((professional) => (
                        <ProfessionalCard
                          key={professional._id}
                          professional={professional}
                          onRequest={() => handleRequestConsultation(professional._id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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

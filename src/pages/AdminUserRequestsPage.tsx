
import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getHouseRequests, updateHouseRequestStatus } from '@/services/houseService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HouseRequest {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  houseId: {
    _id: string;
    title: string;
    location: string;
    price: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminUserRequestsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<HouseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchRequests = async () => {
      try {
        const allRequests = await getHouseRequests();
        setRequests(allRequests);
      } catch (error) {
        console.error('Error fetching house requests:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch house requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user, toast]);
  
  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await updateHouseRequestStatus(requestId, status);
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId ? { ...request, status } : request
        )
      );
      
      toast({
        title: `Request ${status}`,
        description: `The house request has been ${status}.`,
      });
    } catch (error) {
      console.error(`Error ${status} request:`, error);
      toast({
        title: 'Error',
        description: `Could not ${status} the request`,
        variant: 'destructive',
      });
    }
  };
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <div className="mb-6">
            <Link to="/admin" className="inline-flex items-center text-accent hover:underline mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-serif mt-4 mb-6">User House Requests</h1>
          </div>
          
          <Card className="shadow-sm mb-8">
            <CardHeader>
              <CardTitle>House Requests</CardTitle>
              <CardDescription>
                Manage all user requests for houses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <p>Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No house requests found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>House</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>
                          <div className="font-medium">{request.userId.fullName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{request.userId.email}</div>
                          <div className="text-sm text-muted-foreground">{request.userId.phoneNumber}</div>
                        </TableCell>
                        <TableCell>{request.houseId.title}</TableCell>
                        <TableCell>{request.houseId.location}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant={request.status === 'approved' ? 'outline' : 'default'} 
                              className={request.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                              onClick={() => handleStatusUpdate(request._id, 'approved')}
                              disabled={request.status === 'approved'}
                            >
                              {request.status === 'approved' ? 'Approved' : 'Approve'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={request.status === 'rejected' ? 'outline' : 'destructive'} 
                              className={request.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                              onClick={() => handleStatusUpdate(request._id, 'rejected')}
                              disabled={request.status === 'rejected'}
                            >
                              {request.status === 'rejected' ? 'Rejected' : 'Reject'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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

export default AdminUserRequestsPage;

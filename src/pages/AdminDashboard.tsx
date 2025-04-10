
import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { House } from '@/types';
import { getHouses, updateHouse, deleteHouse } from '@/services/houseService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchHouses = async () => {
      try {
        const allHouses = await getHouses();
        setHouses(allHouses);
      } catch (error) {
        console.error('Error fetching houses:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch houses',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHouses();
  }, [user, toast]);
  
  const handleAvailabilityChange = async (houseId: string, available: boolean) => {
    try {
      const updatedHouse = await updateHouse(houseId, { available });
      
      setHouses(prevHouses =>
        prevHouses.map(house =>
          house._id === houseId ? updatedHouse : house
        )
      );
      
      toast({
        title: 'House Updated',
        description: `House is now ${available ? 'available' : 'sold'}`,
      });
    } catch (error) {
      console.error('Error updating house:', error);
      toast({
        title: 'Error',
        description: 'Could not update house availability',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteHouse = async () => {
    if (!houseToDelete) return;
    
    try {
      await deleteHouse(houseToDelete);
      
      setHouses(prevHouses =>
        prevHouses.filter(house => house._id !== houseToDelete)
      );
      
      toast({
        title: 'House Deleted',
        description: 'House has been removed from the listings',
      });
      
      setDialogOpen(false);
      setHouseToDelete(null);
    } catch (error) {
      console.error('Error deleting house:', error);
      toast({
        title: 'Error',
        description: 'Could not delete house',
        variant: 'destructive',
      });
    }
  };
  
  const confirmDelete = (houseId: string) => {
    setHouseToDelete(houseId);
    setDialogOpen(true);
  };
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif">Admin Dashboard</h1>
            <Link to="/admin/add-house">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New House
              </Button>
            </Link>
          </div>
          
          <Card className="shadow-sm mb-10">
            <CardHeader>
              <CardTitle>House Listings</CardTitle>
              <CardDescription>
                Manage all property listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <p>Loading houses...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {houses.map(house => (
                      <TableRow key={house._id}>
                        <TableCell className="font-medium">{house.title}</TableCell>
                        <TableCell>
                          {house.houseType === 'single' && 'Single Story'}
                          {house.houseType === 'two' && 'Two Story'}
                          {house.houseType === 'three' && 'Three Story'}
                          {house.houseType === 'box' && 'Box Style'}
                        </TableCell>
                        <TableCell>{house.location}</TableCell>
                        <TableCell>{formatCurrency(house.price)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={house.available}
                            onCheckedChange={(checked) => 
                              handleAvailabilityChange(house._id, checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link to={`/admin/edit-house/${house._id}`}>
                              <Button size="icon" variant="ghost">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => confirmDelete(house._id)}
                            >
                              <Trash className="h-4 w-4" />
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
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Total Houses</p>
                  <p className="text-3xl font-bold">{houses.length}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Available</p>
                  <p className="text-3xl font-bold">
                    {houses.filter(house => house.available).length}
                  </p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Sold</p>
                  <p className="text-3xl font-bold">
                    {houses.filter(house => !house.available).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this house? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHouse}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <footer className="bg-estate-950 text-white py-6">
        <div className="container text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} EstateCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;

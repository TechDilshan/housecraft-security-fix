import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { HouseType } from '@/types';
import { createHouse } from '@/services/houseService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { House } from '@/types';

// Form validation schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(3, "Location is required"),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  houseType: z.enum(['single', 'two', 'three', 'box'] as const),
  images: z.array(z.string()).min(1, "At least one image URL is required"),
  available: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const AddHousePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: '',
      houseType: 'single',
      images: [],
      available: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Create a properly typed house object
      // All fields from the form are required since they're validated by zod
      const houseData: Omit<House, 'id'> = {
        title: values.title,
        description: values.description,
        location: values.location,
        price: Number(values.price),
        houseType: values.houseType,
        images: values.images,
        available: values.available,
      };

      await createHouse(houseData);
      toast({
        title: "Success",
        description: "House listing added successfully",
      });
      navigate('/admin');
    } catch (error) {
      console.error('Error adding house:', error);
      toast({
        title: "Error",
        description: "Failed to add house listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add image URL to the array
  const addImage = () => {
    if (!imageUrl) return;
    
    form.setValue('images', [...form.getValues('images'), imageUrl]);
    setImageUrl('');
  };

  // Remove image from the array
  const removeImage = (index: number) => {
    const images = form.getValues('images').filter((_, i) => i !== index);
    form.setValue('images', images);
  };

  // If user is not admin, redirect to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <div className="mb-8">
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline" 
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Add New House</CardTitle>
              <CardDescription>
                Create a new house listing in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Beautiful Family Home" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter price" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="houseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>House Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select house type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Single Story</SelectItem>
                              <SelectItem value="two">Two Story</SelectItem>
                              <SelectItem value="three">Three Story</SelectItem>
                              <SelectItem value="box">Box Style</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed house description" 
                            {...field}
                            className="min-h-32" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="images"
                      render={() => (
                        <FormItem>
                          <FormLabel>Images</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Image URL"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              onClick={addImage}
                              variant="secondary"
                            >
                              Add Image
                            </Button>
                          </div>
                          <FormMessage />
                          
                          {form.getValues('images').length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Added Images:</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {form.getValues('images').map((url, index) => (
                                  <div 
                                    key={index}
                                    className="relative group rounded-md overflow-hidden border"
                                  >
                                    <img 
                                      src={url} 
                                      alt={`House ${index + 1}`} 
                                      className="w-full h-32 object-cover"
                                      onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src = "/placeholder.svg";
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? "Adding..." : "Add House"}
                    </Button>
                  </div>
                </form>
              </Form>
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

export default AddHousePage;

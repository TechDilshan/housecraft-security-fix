
import React, { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
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
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
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
  images: z.array(z.string()).default([]),
  available: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const AddHousePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Create a properly typed house object with _id field
      const houseData: Omit<House, '_id'> = {
        title: values.title,
        description: values.description,
        location: values.location,
        price: Number(values.price),
        houseType: values.houseType,
        images: values.images,
        available: values.available,
      };

      // Submit form with uploaded files
      await createHouse(houseData, uploadedFiles);
      
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...selectedFiles]);
      
      // Display preview images
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            // Add preview URLs to form (these will be replaced with Firebase URLs on submit)
            form.setValue('images', [...form.getValues('images'), event.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
    
    // Also remove from preview
    removeImage(index);
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
                    {/* Title field */}
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

                    {/* Location field */}
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

                    {/* Price field */}
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

                    {/* House Type field */}
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

                  {/* Description field */}
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

                  {/* Image upload section */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="images"
                      render={() => (
                        <FormItem>
                          <FormLabel>Images</FormLabel>
                          
                          {/* File upload button */}
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => fileInputRef.current?.click()}
                              className="flex gap-2"
                            >
                              <Upload size={16} />
                              Upload Images
                            </Button>
                            
                            {/* External URL option */}
                            <div className="flex gap-2 flex-1">
                              <Input
                                placeholder="Or add image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                              />
                              <Button 
                                type="button" 
                                onClick={addImage}
                                variant="secondary"
                              >
                                Add URL
                              </Button>
                            </div>
                          </div>
                          <FormMessage />
                          
                          {/* Display added images */}
                          {form.getValues('images').length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Image Previews:</p>
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
                                      onClick={() => removeFile(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X size={16} />
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

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || uploadingImages}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : "Add House"}
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

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Image, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import config from '@/config';

interface Cause {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  imageUrl?: string;
  story?: string;
  location?: string;
  creator?: any;
  sponsors?: any[];
}

const CauseEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cause, setCause] = useState<Cause | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAmount: 0,
    location: '',
    story: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch cause data
  useEffect(() => {
    const fetchCause = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/causes/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cause');
        }

        const data = await response.json();
        setCause(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          targetAmount: data.targetAmount || 0,
          location: data.location || '',
          story: data.story || ''
        });
        
        // Set image preview if cause has an image
        if (data.imageUrl) {
          setImagePreview(data.imageUrl.startsWith('http') ? data.imageUrl : `${config.apiUrl}/${data.imageUrl}`);
        }
      } catch (err) {
        console.error('Error fetching cause:', err);
        toast({
          title: 'Error',
          description: 'Failed to load cause data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCause();
    }
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleImageClick = () => {
    // Trigger the hidden file input when the image preview is clicked
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Create a FormData object if there's an image to upload
      if (imageFile) {
        const formDataWithImage = new FormData();
        
        // Add all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          formDataWithImage.append(key, String(value));
        });
        
        // Add the image file
        formDataWithImage.append('image', imageFile);
        
        // Send the request with FormData
        const response = await fetch(`${config.apiUrl}/causes/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataWithImage
        });

        if (!response.ok) {
          throw new Error('Failed to update cause');
        }

        toast({
          title: 'Success',
          description: 'Cause updated successfully with new image',
        });
      } else {
        // Send a regular JSON request if no image is being uploaded
        const response = await fetch(`${config.apiUrl}/causes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to update cause');
        }

        toast({
          title: 'Success',
          description: 'Cause updated successfully',
        });
      }
      
      navigate('/admin/causes');
    } catch (err) {
      console.error('Error updating cause:', err);
      toast({
        title: 'Error',
        description: 'Failed to update cause. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Cause" subtitle="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Cause" subtitle={`Editing: ${cause?.title}`}>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="Education">Education</SelectItem>
                     <SelectItem value="Health">Health</SelectItem>
                     <SelectItem value="Environment">Environment</SelectItem>
                     <SelectItem value="Poverty">Poverty</SelectItem>
                     <SelectItem value="Humanitarian">Humanitarian</SelectItem>
                     <SelectItem value="Animals">Animals</SelectItem>
                     <SelectItem value="Community">Community</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div>
                 <Label htmlFor="targetAmount">Target Amount ($)</Label>
                 <Input
                   id="targetAmount"
                   name="targetAmount"
                   type="number"
                   value={formData.targetAmount}
                   onChange={handleNumberChange}
                   required
                 />
               </div>
               
               <div>
                 <Label htmlFor="location">Location</Label>
                 <Input
                   id="location"
                   name="location"
                   value={formData.location}
                   onChange={handleInputChange}
                 />
               </div>
               
               <div>
                <Label htmlFor="story">Story</Label>
                <Textarea
                  id="story"
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="image">Cause Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative group cursor-pointer" onClick={handleImageClick}>
                      <img 
                        src={imagePreview} 
                        alt="Cause preview" 
                        className="w-full max-w-md h-64 object-cover rounded-md border border-gray-200"
                      />
                      <div className="absolute items-center justify-center rounded-md">
                        <Upload className="h-10 w-10 text-white" />
                        <span className="text-white ml-2 font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handleImageClick}
                    >
                      <Image className="h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/causes')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CauseEdit;
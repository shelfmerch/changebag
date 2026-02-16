import React, { useState, useRef } from 'react';
import { getApiUrl, getFullUrl } from '@/utils/apiUtils';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Heart, Users, Target, Globe, Calendar, Tag, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import axios from 'axios';
import config from '@/config';

const CreateCause = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetAmount: '',
    location: '',
    category: '',
    tags: [] as string[],
    currentTag: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Education',
    'Healthcare',
    'Environment',
    'Poverty Relief',
    'Disaster Relief',
    'Animal Welfare',
    'Community Development',
    'Human Rights',
    'Technology Access',
    'Arts & Culture'
  ];
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.targetAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('targetAmount', formData.targetAmount);
      formDataToSend.append('category', formData.category);
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }
      
      // Handle image
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }
      
      const response = await fetch(getApiUrl('/causes'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(data.message || 'Failed to create cause');
      }
      
      toast({
        title: 'Success',
        description: 'Cause created successfully!'
      });
      
      navigate('/causes');
      
    } catch (error: any) {
      console.error('Error creating cause:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create cause. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const addTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Layout>
      <main className="max-w-4xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create a Cause</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a cause that needs support? Share your story and connect with sponsors who want to make a difference.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold mb-2">Make an Impact</h3>
            <p className="text-sm text-gray-600">Turn your passion into positive change</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold mb-2">Find Sponsors</h3>
            <p className="text-sm text-gray-600">Connect with people who share your vision</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold mb-2">Reach Goals</h3>
            <p className="text-sm text-gray-600">Get the funding you need to succeed</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold mb-2">Global Reach</h3>
            <p className="text-sm text-gray-600">Share your cause with a worldwide audience</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Your Cause</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Cause Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Clean Water for Rural Communities"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your cause is about and why it matters..."
                  rows={5}
                  required
                />
              </div>

              {/* <div className="grid md:grid-cols-2 gap-6"> */}
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (₹) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                    placeholder="e.g. 5000"
                    min="1"
                    required
                  />
                </div>
                 <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {/* <div className="flex items-center space-x-2"> */}
                  {/* <MapPin className="h-4 w-4 text-gray-500" /> */}
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Mumbai, India"
                  />
                {/* </div> */}
              </div>
              </div>
              
              {/* <div className="space-y-2">
                <Label htmlFor="imageUpload">Upload Image</Label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">Or provide an image URL:</p>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                  </div>
                </div>
                 {imagePreview && (
                    <div className="flex items-center justify-center border rounded-md p-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-40 max-w-full object-contain" 
                      />
                    </div>
                  )}
              </div> */}

                            <div className="space-y-2">
                <Label htmlFor="imageUpload">Upload Image</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="Or paste image URL here..."
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Upload a file or provide an image URL</p>
                {imagePreview && (
                  <div className="flex items-center justify-center border rounded-md p-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-40 max-w-full object-contain" 
                    />
                  </div>
                )}
              </div>


              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your cause will be reviewed by our team</li>
                  <li>• Once approved, it will be published on our platform</li>
                  <li>• Sponsors can then discover and support your cause</li>
                  <li>• You'll receive notifications about new sponsors and updates</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate('/causes')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Cause'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
};

export default CreateCause;

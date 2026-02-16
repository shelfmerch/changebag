
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitStory } from '@/services/apiServices';
import { toast } from "sonner";

const SubmitStory = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    authorName: '',
    imageUrl: '',
    content: ''
  });

  const mutation = useMutation({
    mutationFn: submitStory,
    onSuccess: () => {
      toast.success("Your story has been submitted successfully!");
      navigate('/stories');
    },
    onError: () => {
      toast.error("There was an error submitting your story. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <main className="max-w-2xl mx-auto py-16 px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/">Home</Link> &gt; <Link to="/stories">Stories</Link> &gt; Submit
        </nav>

        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-6">Share Your Story</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Give your story a title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authorName">Your Name</Label>
                <Input
                  id="authorName"
                  name="authorName"
                  value={form.authorName}
                  onChange={handleChange}
                  placeholder="How you'd like to be identified"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                />
                <p className="text-xs text-gray-500">Add a link to an image that represents your story</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Your Story</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Share your experience with Changebag..."
                  rows={8}
                  required
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit Story'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
};

export default SubmitStory;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/utils/apiUtils';

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
  adminImageUrl?: string;
  story?: string;
  location?: string;
  distributionStartDate?: Date;
  distributionEndDate?: Date;
}

const EditCause = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cause, setCause] = useState<Cause | null>(null);

  useEffect(() => {
    const fetchCause = async () => {
      try {
        const response = await fetch(getApiUrl(`/causes/${id}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cause');
        }

        const data = await response.json();
        // Convert date strings to Date objects
        if (data.distributionStartDate) {
          data.distributionStartDate = new Date(data.distributionStartDate);
        }
        if (data.distributionEndDate) {
          data.distributionEndDate = new Date(data.distributionEndDate);
        }
        setCause(data);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load cause details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCause();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cause) return;

    setSaving(true);
    try {
      const response = await fetch(getApiUrl(`/causes/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cause)
      });

      if (!response.ok) {
        throw new Error('Failed to update cause');
      }

      toast({
        title: 'Success',
        description: 'Cause updated successfully'
      });
      navigate('/admin/causes');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cause',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Cause, value: any) => {
    if (!cause) return;
    setCause({ ...cause, [field]: value });
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Cause" subtitle="Loading...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!cause) {
    return (
      <AdminLayout title="Edit Cause" subtitle="Error">
        <div className="text-center">
          <p>Cause not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Cause" subtitle="Edit cause details">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={cause.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={cause.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={cause.imageUrl || ''}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter a direct URL to an image for this cause
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={cause.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={cause.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={cause.targetAmount}
                  onChange={(e) => handleChange('targetAmount', Number(e.target.value))}
                  required
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  value={cause.currentAmount}
                  onChange={(e) => handleChange('currentAmount', Number(e.target.value))}
                  required
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Duration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left",
                        !cause.distributionStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {cause.distributionStartDate ? (
                        format(cause.distributionStartDate, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={cause.distributionStartDate}
                      onSelect={(date) => handleChange('distributionStartDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left",
                        !cause.distributionEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {cause.distributionEndDate ? (
                        format(cause.distributionEndDate, "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={cause.distributionEndDate}
                      onSelect={(date) => handleChange('distributionEndDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/causes')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditCause; 
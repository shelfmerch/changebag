import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Upload, Save, Eye } from 'lucide-react';
import { fetchCause } from '@/services/apiServices';
import { getFullUrl } from '@/utils/apiUtils';
import config from '@/config';

interface ContentEditorProps {
  causeId: string;
}

const CauseContentEditor: React.FC<ContentEditorProps> = ({ causeId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch cause data
  const { data: cause, isLoading, error } = useQuery({
    queryKey: ['cause', causeId],
    queryFn: () => fetchCause(causeId),
    enabled: !!causeId,
  });

  // Form state
  const [formData, setFormData] = useState({
    // Hero section
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    heroBackgroundColor: '',
    
    // Impact section
    impactTitle: '',
    impactSubtitle: '',
    impactStats: [] as Array<{
      icon: string;
      value: string;
      label: string;
      description?: string;
    }>,
    
    // Progress section
    progressTitle: '',
    progressSubtitle: '',
    progressBackgroundImageUrl: '',
    progressCards: [] as Array<{
      title: string;
      value: string;
      description: string;
      icon: string;
      additionalInfo?: string;
    }>,
    
    // FAQs
    faqs: [] as Array<{
      question: string;
      answer: string;
      category?: string;
    }>,
    
    // CTA
    ctaTitle: '',
    ctaSubtitle: '',
    ctaPrimaryButtonText: '',
    ctaSecondaryButtonText: '',
    
    // Theming
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
    customCSS: '',
    
    // SEO
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    ogImageUrl: '',
    
    // Additional content
    testimonials: [] as Array<{
      name: string;
      role: string;
      content: string;
      avatarUrl?: string;
    }>,
    
    gallery: [] as Array<{
      imageUrl: string;
      caption?: string;
      alt?: string;
    }>,
    
    partners: [] as Array<{
      name: string;
      logoUrl: string;
      website?: string;
    }>,
  });

  // Update form data when cause data loads
  useEffect(() => {
    if (cause) {
      setFormData({
        heroTitle: cause.heroTitle || '',
        heroSubtitle: cause.heroSubtitle || '',
        heroImageUrl: cause.heroImageUrl || '',
        heroBackgroundColor: cause.heroBackgroundColor || '',
        impactTitle: cause.impactTitle || '',
        impactSubtitle: cause.impactSubtitle || '',
        impactStats: cause.impactStats || [],
        progressTitle: cause.progressTitle || '',
        progressSubtitle: cause.progressSubtitle || '',
        progressBackgroundImageUrl: cause.progressBackgroundImageUrl || '',
        progressCards: cause.progressCards || [],
        faqs: cause.faqs || [],
        ctaTitle: cause.ctaTitle || '',
        ctaSubtitle: cause.ctaSubtitle || '',
        ctaPrimaryButtonText: cause.ctaPrimaryButtonText || '',
        ctaSecondaryButtonText: cause.ctaSecondaryButtonText || '',
        primaryColor: cause.primaryColor || '',
        secondaryColor: cause.secondaryColor || '',
        accentColor: cause.accentColor || '',
        customCSS: cause.customCSS || '',
        metaTitle: cause.metaTitle || '',
        metaDescription: cause.metaDescription || '',
        metaKeywords: cause.metaKeywords || [],
        ogImageUrl: cause.ogImageUrl || '',
        testimonials: cause.testimonials || [],
        gallery: cause.gallery || [],
        partners: cause.partners || [],
      });
    }
  }, [cause]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Saving content for cause:', causeId);
      console.log('Data being sent:', JSON.stringify(data, null, 2));
      
      const response = await fetch(`${config.apiUrl}/causes/${causeId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to save content: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Save response:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Content saved successfully",
        description: "All changes have been saved to the database.",
      });
      queryClient.invalidateQueries({ queryKey: ['cause', causeId] });
    },
    onError: (error) => {
      toast({
        title: "Error saving content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section: string, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (section: string, defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section as keyof typeof prev] as any[]), defaultItem],
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof typeof prev] as any[]).filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cause content...</span>
      </div>
    );
  }

  if (error || !cause) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading cause</h1>
          <Button onClick={() => navigate('/admin/causes')}>
            Back to Causes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Editor</h1>
          <p className="text-gray-600">Edit dynamic content for: {cause.title}</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/cause/${causeId}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Enter hero title (optional - will use cause title if empty)"
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  placeholder="Enter hero subtitle (optional - will use cause description if empty)"
                />
              </div>
              <div>
                <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                <Input
                  id="heroImageUrl"
                  value={formData.heroImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                  placeholder="Enter hero image URL (optional - will use cause image if empty)"
                />
              </div>
              <div>
                <Label htmlFor="heroBackgroundColor">Hero Background Color</Label>
                <Input
                  id="heroBackgroundColor"
                  value={formData.heroBackgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroBackgroundColor: e.target.value }))}
                  placeholder="e.g., #f0f9ff (optional)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Section */}
        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impact Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="impactTitle">Impact Title</Label>
                <Input
                  id="impactTitle"
                  value={formData.impactTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactTitle: e.target.value }))}
                  placeholder="Enter impact section title"
                />
              </div>
              <div>
                <Label htmlFor="impactSubtitle">Impact Subtitle</Label>
                <Textarea
                  id="impactSubtitle"
                  value={formData.impactSubtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactSubtitle: e.target.value }))}
                  placeholder="Enter impact section subtitle"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Impact Stats</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('impactStats', { icon: 'Heart', value: '', label: '', description: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stat
                  </Button>
                </div>
                
                {formData.impactStats.map((stat, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Icon</Label>
                          <Input
                            value={stat.icon}
                            onChange={(e) => handleArrayChange('impactStats', index, 'icon', e.target.value)}
                            placeholder="e.g., Heart, Users, ShoppingBag"
                          />
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={stat.value}
                            onChange={(e) => handleArrayChange('impactStats', index, 'value', e.target.value)}
                            placeholder="e.g., 1,234"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={stat.label}
                            onChange={(e) => handleArrayChange('impactStats', index, 'label', e.target.value)}
                            placeholder="e.g., People Helped"
                          />
                        </div>
                        <div>
                          <Label>Description (optional)</Label>
                          <Input
                            value={stat.description || ''}
                            onChange={(e) => handleArrayChange('impactStats', index, 'description', e.target.value)}
                            placeholder="Additional description"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => removeArrayItem('impactStats', index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Section */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="progressTitle">Progress Title</Label>
                <Input
                  id="progressTitle"
                  value={formData.progressTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, progressTitle: e.target.value }))}
                  placeholder="Enter progress section title"
                />
              </div>
              <div>
                <Label htmlFor="progressSubtitle">Progress Subtitle</Label>
                <Textarea
                  id="progressSubtitle"
                  value={formData.progressSubtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, progressSubtitle: e.target.value }))}
                  placeholder="Enter progress section subtitle"
                />
              </div>
              <div>
                <Label htmlFor="progressBackgroundImageUrl">Background Image URL</Label>
                <Input
                  id="progressBackgroundImageUrl"
                  value={formData.progressBackgroundImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, progressBackgroundImageUrl: e.target.value }))}
                  placeholder="Enter background image URL for progress section"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Progress Cards</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('progressCards', { title: '', value: '', description: '', icon: '', additionalInfo: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </div>
                
                {formData.progressCards.map((card, index) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={card.title}
                            onChange={(e) => handleArrayChange('progressCards', index, 'title', e.target.value)}
                            placeholder="e.g., Amount Raised"
                          />
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={card.value}
                            onChange={(e) => handleArrayChange('progressCards', index, 'value', e.target.value)}
                            placeholder="e.g., ₹50,000"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={card.description}
                            onChange={(e) => handleArrayChange('progressCards', index, 'description', e.target.value)}
                            placeholder="e.g., Out of ₹100,000 target"
                          />
                        </div>
                        <div>
                          <Label>Icon</Label>
                          <Input
                            value={card.icon}
                            onChange={(e) => handleArrayChange('progressCards', index, 'icon', e.target.value)}
                            placeholder="e.g., TrendingDown, Heart, Gift"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Additional Info (optional)</Label>
                          <Input
                            value={card.additionalInfo || ''}
                            onChange={(e) => handleArrayChange('progressCards', index, 'additionalInfo', e.target.value)}
                            placeholder="e.g., 75% of goal reached"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => removeArrayItem('progressCards', index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Section */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Label>FAQ Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('faqs', { question: '', answer: '', category: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
              
              {formData.faqs.map((faq, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Question</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => handleArrayChange('faqs', index, 'question', e.target.value)}
                          placeholder="Enter the question"
                        />
                      </div>
                      <div>
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => handleArrayChange('faqs', index, 'answer', e.target.value)}
                          placeholder="Enter the answer"
                        />
                      </div>
                      <div>
                        <Label>Category (optional)</Label>
                        <Input
                          value={faq.category || ''}
                          onChange={(e) => handleArrayChange('faqs', index, 'category', e.target.value)}
                          placeholder="e.g., General, Sponsorship, Claims"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeArrayItem('faqs', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Section */}
        <TabsContent value="cta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ctaTitle">CTA Title</Label>
                <Input
                  id="ctaTitle"
                  value={formData.ctaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaTitle: e.target.value }))}
                  placeholder="Enter CTA title"
                />
              </div>
              <div>
                <Label htmlFor="ctaSubtitle">CTA Subtitle</Label>
                <Textarea
                  id="ctaSubtitle"
                  value={formData.ctaSubtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaSubtitle: e.target.value }))}
                  placeholder="Enter CTA subtitle"
                />
              </div>
              <div>
                <Label htmlFor="ctaPrimaryButtonText">Primary Button Text</Label>
                <Input
                  id="ctaPrimaryButtonText"
                  value={formData.ctaPrimaryButtonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaPrimaryButtonText: e.target.value }))}
                  placeholder="e.g., 🎁 Claim Your Free Bag"
                />
              </div>
              <div>
                <Label htmlFor="ctaSecondaryButtonText">Secondary Button Text</Label>
                <Input
                  id="ctaSecondaryButtonText"
                  value={formData.ctaSecondaryButtonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaSecondaryButtonText: e.target.value }))}
                  placeholder="e.g., 📢 Sponsor This Cause"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Section */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="e.g., #3b82f6"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="e.g., #1e40af"
                  />
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Input
                    id="accentColor"
                    value={formData.accentColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                    placeholder="e.g., #f59e0b"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="customCSS">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  value={formData.customCSS}
                  onChange={(e) => setFormData(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder="Enter custom CSS styles"
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO meta title"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO meta description"
                />
              </div>
              
              <div>
                <Label htmlFor="ogImageUrl">Open Graph Image URL</Label>
                <Input
                  id="ogImageUrl"
                  value={formData.ogImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogImageUrl: e.target.value }))}
                  placeholder="Social media preview image URL"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CauseContentEditor; 
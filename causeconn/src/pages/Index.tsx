import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import config from '@/config';

interface Cause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  status: string;
  location: string;
  creator: any;
  createdAt: string;
  updatedAt: string;
  sponsorships?: Array<{
    _id: string;
    status: string;
  }>;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [featuredCauses, setFeaturedCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch featured causes from the API
  useEffect(() => {
    const fetchFeaturedCauses = async () => {
      try {
        setLoading(true);
        // Fetch causes with their sponsorships, limit to 3 featured causes
        const response = await axios.get(`${config.apiUrl}/causes`, {
          params: { 
            status: 'approved',
            include: 'sponsorships',
            limit: 3,
            featured: true,
            isOnline: true
          }
        });
        
        console.log('Fetched featured causes:', response.data);
        // Ensure we only use up to 3 causes even if API returns more
        setFeaturedCauses(response.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured causes:', err);
        setError('Failed to load featured causes.');
        // Use mock data as fallback if API fails
        setFeaturedCauses([
          {
            _id: '1',
            title: 'Clean Water Initiative',
            description: 'Providing clean drinking water to communities in need.',
            imageUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2d5d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            currentAmount: 12500,
            targetAmount: 25000,
            category: 'Environment',
            status: 'approved',
            location: 'Global',
            creator: { name: 'Water Foundation' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: "Children's Education Fund",
            description: 'Supporting education for underprivileged children worldwide.',
            imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            currentAmount: 8700,
            targetAmount: 15000,
            category: 'Education',
            status: 'approved',
            location: 'Global',
            creator: { name: 'Education Alliance' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '3',
            title: 'Women Entrepreneurs',
            description: 'Empowering women with resources to start their own businesses.',
            imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            currentAmount: 6300,
            targetAmount: 10000,
            category: 'Economic Development',
            status: 'approved',
            location: 'Global',
            creator: { name: 'Women Empowerment Network' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCauses();
  }, []);
  
  // Check if a cause has approved sponsorships
  const hasApprovedSponsorship = (cause: Cause) => {
    return cause.sponsorships?.some(s => s.status === 'approved') || false;
  };
  
  // Handle share button click
  const handleShareAction = (cause: Cause) => {
    // Create the share URL for the cause
    const shareUrl = `${window.location.origin}/cause/${cause._id}`;
    
    // Check if the Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: cause.title,
        text: cause.description,
        url: shareUrl,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Thanks for sharing this cause!",
          variant: "default"
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied to clipboard!",
            description: "Share it with your friends and family.",
            variant: "default"
          });
        })
        .catch((error) => {
          console.error('Error copying to clipboard:', error);
        });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Thoughtful Partnerships for Negative Change
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Connect your brand with causes that align with your values. 
                Sponsor initiatives that make a real difference in the world.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={() => navigate('/causes')} 
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Browse Causes
                </Button>
                <Button 
                  onClick={() => navigate('/sponsor/new')} 
                  variant="outline" 
                  size="lg"
                  className="border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  Become a Sponsor
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="People collaborating on community project" 
                className="rounded-lg shadow-xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Causes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Causes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These causes are making a significant impact and looking for sponsors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <>
                <Card className="h-96 animate-pulse bg-gray-100"></Card>
                <Card className="h-96 animate-pulse bg-gray-100"></Card>
                <Card className="h-96 animate-pulse bg-gray-100"></Card>
              </>
            ) : error && featuredCauses.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : (
              featuredCauses.map((cause) => (
                <Card key={cause._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="cursor-pointer" 
                    onClick={() => navigate(`/cause/${cause._id}`)}
                    title={`View details for ${cause.title}`}
                  >
                    <img 
                      src={getImageUrl(cause.imageUrl)} 
                      alt={cause.title} 
                      className="w-full h-48 object-cover hover:opacity-90 transition-opacity" 
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{cause.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-auto" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareAction(cause);
                          }}
                          title="Share this cause"
                        >
                          <Share2 className="h-4 w-4 text-gray-500 hover:text-primary" />
                        </Button>
                      </div>
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                        {cause.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {cause.description.length > 120 
                        ? `${cause.description.substring(0, 120)}...` 
                        : cause.description}
                    </p>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(((cause.currentAmount || 0) / cause.targetAmount) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          ${(cause.currentAmount || 0).toLocaleString()} raised
                        </span>
                        <span className="text-sm text-gray-500">
                          ${cause.targetAmount.toLocaleString()} goal
                        </span>
                      </div>
                    </div>
                    {hasApprovedSponsorship(cause) ? (
                      <Button 
                        onClick={() => navigate(`/claim/${cause._id}`)} 
                        className="w-full bg-black text-white"
                      >
                        Claim a Tote
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate(`/cause/${cause._id}`)} 
                        className="w-full"
                        variant="outline"
                      >
                        See Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('/causes')} 
              variant="outline" 
              size="lg"
              className="border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              View All Causes
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple process to connect sponsors with meaningful causes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Browse Causes</h3>
              <p className="text-gray-600">
                Explore our curated list of vetted causes making a real difference.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Choose to Sponsor</h3>
              <p className="text-gray-600">
                Select a cause that aligns with your values and decide on your contribution.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Create Impact</h3>
              <p className="text-gray-600">
                Your sponsorship provides resources while showcasing your brand's commitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Showcase */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Sponsors</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join these forward-thinking organizations making a difference.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-75">
            <div className="w-32 h-20 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-400">Brand A</div>
            </div>
            <div className="w-32 h-20 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-400">Brand B</div>
            </div>
            <div className="w-32 h-20 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-400">Brand C</div>
            </div>
            <div className="w-32 h-20 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-400">Brand D</div>
            </div>
            <div className="w-32 h-20 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-400">Brand E</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of sponsors and help bring positive change to the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => navigate('/causes')} 
              variant="secondary" 
              size="lg"
            >
              Browse Causes
            </Button>
            <Button 
              onClick={() => navigate('/sponsor/new')} 
              variant="outline" 
              size="lg"
              className="bg-black text-white hover:text-white border-black hover:bg-gray-800"
            >
              Become a Sponsor
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

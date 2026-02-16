import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Share2, Search, Filter, Tag, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import config from '@/config';
import axios, { AxiosResponse } from 'axios';



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

const CausesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Helper functions - moved to the top
  const isTargetAchieved = (cause: Cause) => {
    return (cause.currentAmount || 0) >= cause.targetAmount;
  };

  const hasApprovedSponsorship = (cause: Cause) => {
    return cause.sponsorships?.some(s => s.status === 'approved') || false;
  };

  // Fetch causes from the API
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        setLoading(true);
        // Fetch causes with their sponsorships
        console.log('Fetching causes using API client');
        const response: AxiosResponse<Cause[]> = await axios.get(`${config.apiUrl}/causes`, {
          params: {
            status: 'approved',
            include: 'sponsorships',
            isOnline: true
          }
        });

        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          console.log('Fetched causes:', response.data);
          setCauses(response.data);

          // Extract unique categories from the fetched causes
          const uniqueCategories = Array.from(new Set(response.data.map((cause: Cause) => cause.category)));
          setCategories(uniqueCategories as string[]);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format from server');
        }
      } catch (err: any) {
        console.error('Error fetching causes:', err);
        console.error('Response data:', err.response?.data);
        console.error('Response status:', err.response?.status);
        setError(err.response?.data?.message || 'Failed to load causes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  // Listen for widget messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, verify event.origin matches your widget logic
      // if (event.origin !== config.frontendUrl) return; 

      const { type, data } = event.data;

      if (type === 'SPONSOR_SUCCESS') {
        console.log('Sponsorship successful:', data);
        // setIsWidgetOpen(false); // Keep open to show confirmation step
        toast({
          title: "Sponsorship Successful!",
          description: `Thank you for sponsoring ${data.organizationName || 'this cause'}!`,
          variant: "default",
          duration: 5000,
        });
        // Ideally trigger a refresh of causes here
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  // Filter causes based on search and filters
  const filteredCauses = causes.filter(cause => {
    // Hide causes that have achieved their target amount
    // if (isTargetAchieved(cause)) return false;

    const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cause.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || cause.category === categoryFilter;

    // Status filter logic
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const hasApprovedSponsorship = cause.sponsorships?.some(s => s.status === 'approved');
      const isFullyFunded = (cause.currentAmount || 0) >= cause.targetAmount;

      switch (statusFilter) {
        case 'open':
          matchesStatus = hasApprovedSponsorship && !isFullyFunded;
          break;
        case 'sponsored':
          matchesStatus = hasApprovedSponsorship && isFullyFunded;
          break;
        case 'waitlist':
          matchesStatus = !hasApprovedSponsorship;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle claim button click
  const handleClaimAction = (cause: Cause) => {
    navigate(`/claim/${cause._id}?source=direct&ref=causes-page`);
  };

  // Handle sponsor button click
  const handleSponsorAction = (cause: Cause) => {
    setSelectedCause(cause);
    setIsWidgetOpen(true);
  };

  // Get the details/claim button based on sponsorship status
  const getDetailsOrClaimButton = (cause: Cause) => {
    if (hasApprovedSponsorship(cause)) {
      return (
        <Button
          onClick={() => navigate(`/claim/${cause._id}?source=direct&ref=causes-page`)}
          className="w-full bg-black text-white"
        >
          Claim a Tote
        </Button>
      );
    }
    return null;
  };

  // Get the sponsor or waitlist button
  const getSponsorOrWaitlistButton = (cause: Cause) => {
    // Only show sponsor button if target not achieved
    if (!isTargetAchieved(cause)) {
      return (
        <Button
          onClick={() => handleSponsorAction(cause)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Sponsor This Cause
        </Button>
      );
    }
    return null;
  };

  // Get waitlist button for unsponsored causes
  const getWaitlistButton = (cause: Cause) => {
    // Show waitlist button if cause doesn't have approved sponsorship
    if (!hasApprovedSponsorship(cause)) {
      return (
        <Button
          onClick={() => navigate(`/waitlist/${cause._id}`)}
          className="w-full"
          variant="outline"
        >
          Join Waitlist
        </Button>
      );
    }
    return null;
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
          toast({
            title: "Sharing failed",
            description: "Please try again or copy the link manually.",
            variant: "destructive"
          });
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
          toast({
            title: "Copying failed",
            description: `Share this link manually: ${shareUrl}`,
            variant: "destructive"
          });
        });
    }
  };

  // --- DYNAMIC CAUSE ROUTES LOGIC ---
  // Sort causes by createdAt descending
  const sortedCauses = [...filteredCauses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Layout>
      <div className="relative bg-gradient-to-br from-green-600 via-green-300 to-white min-h-[400px]">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center">
            {/* Discover & Support button in top right */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white border border-white/20 shadow-lg">
                <Search className="h-4 w-4" />
                Discover & Support
              </div>
            </div>

            {/* Main title and subtitle */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Browse <span className="text-green-500">Causes</span>
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto leading-relaxed">
              Find and support causes aligned with your organization's values.
              Every sponsorship creates real impact.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {/* Enhanced Filters section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Refine Your Search</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700">
                Search Causes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-green-600 focus:ring-green-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-green-600 focus:ring-green-600">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open for Sponsorship</SelectItem>
                  <SelectItem value="sponsored">Fully Sponsored</SelectItem>
                  <SelectItem value="waitlist">Waitlist Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200">
                    Search: "{searchTerm}"
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-800">
                    Category: {categoryFilter}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setCategoryFilter('all')}
                    />
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300">
                    Status: {statusFilter}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setStatusFilter('all')}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading causes...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredCauses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCauses.map((cause) => (
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

                  {/* <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(((cause.currentAmount || 0) / cause.targetAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">
                      ₹{(cause.currentAmount || 0).toLocaleString()} raised
                      </span>
                      <span className="text-sm text-gray-500">
                      ₹{cause.targetAmount.toLocaleString()} goal
                      </span>
                    </div>
                  </div> */}

                  <div className="space-y-3">
                    {getDetailsOrClaimButton(cause)}
                    {getSponsorOrWaitlistButton(cause)}
                    {getWaitlistButton(cause)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching causes found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
            <Button onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isWidgetOpen} onOpenChange={setIsWidgetOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden bg-white border-0">
          <DialogHeader className="hidden">
            <DialogTitle>Sponsor Cause</DialogTitle>
          </DialogHeader>
          {selectedCause && (
            <iframe
              src={`http://localhost:8085/widget/sponsor?causeId=${selectedCause._id}&theme=light`}
              className="w-full h-full border-0"
              title="Sponsor Widget"
              allow="payment"
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CausesPage;

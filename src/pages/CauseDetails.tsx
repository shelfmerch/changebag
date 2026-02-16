import React, { useState } from 'react';
import { getApiUrl, getFullUrl } from '@/utils/apiUtils';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCause } from '@/services/apiServices';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '../components/Layout';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Share2 } from 'lucide-react';
import config from '@/config';

// Import all cause-details components
import HeroSection from '@/components/cause-details/HeroSection';
import CauseDetailsBreadcrumb from '@/components/cause-details/CauseDetailsBreadcrumb';
import CauseDetailsHeader from '@/components/cause-details/CauseDetailsHeader';
import CauseImageAndStory from '@/components/cause-details/CauseImageAndStory';
import CauseDetailsSidebar from '@/components/cause-details/CauseDetailsSidebar';
import BenefitsSection from '@/components/cause-details/BenefitsSection';
import BriefStory from '@/components/cause-details/BriefStory';
import DetailedDescription from '@/components/cause-details/DetailedDescription';
import FaqAccordion from '@/components/cause-details/FaqAccordion';
import FinalCallout from '@/components/cause-details/FinalCallout';
import ImpactBreakdown from '@/components/cause-details/ImpactBreakdown';
import ImpactGrid from '@/components/cause-details/ImpactGrid';
import ImpactStats from '@/components/cause-details/ImpactStats';
import OverviewCards from '@/components/cause-details/OverviewCards';
import SponsorShowcase from '@/components/cause-details/SponsorShowcase';
import StatBanner from '@/components/cause-details/StatBanner';
import StickyBottomBar from '@/components/cause-details/StickyBottomBar';
import TransparencyTrust from '@/components/cause-details/TransparencyTrust';
import WhyItMatters from '@/components/cause-details/WhyItMatters';

const CauseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  
  // Fetch cause data from the API
  const { data: cause, isLoading, error } = useQuery({
    queryKey: ['cause', id],
    queryFn: async () => {
      try {
        // In a real app, this would fetch from the actual API endpoint
        const response = await fetch(getApiUrl(`/causes/${id}`));
        if (!response.ok) {
          throw new Error('Failed to fetch cause details');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching cause:', error);
        // Fallback to the mock data if the real API fails
        return fetchCause(id!);
      }
    },
    enabled: !!id,
  });

  // Action handlers
  const handleAction = () => {
    // Navigate to claim page
    navigate(`/claim/${id}?source=direct&ref=cause-details`);
  };
  
  const handleSponsor = () => {
    // Navigate to sponsor form
    navigate(`/sponsor/new?causeId=${id}`);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: cause?.title || 'Check out this cause',
          text: cause?.description || 'Help support this important cause',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Share this cause with your friends and family.",
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      toast({
        title: "Sharing failed",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
    setTimeout(() => setIsSharing(false), 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Loading cause details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !cause) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              {error ? 'Error loading cause details' : 'Cause not found'}
            </h1>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              onClick={() => navigate('/causes')}
            >
              Back to Causes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if the cause has any sponsors
  const hasSponsorship = cause.sponsors && cause.sponsors.length > 0;

  // Format the impact stats
  const impactStats = [
    { label: "People Helped", value: cause.impactStats?.peopleHelped || 0, icon: "users" },
    { label: "Bags Distributed", value: cause.impactStats?.bagsDistributed || 0, icon: "shopping-bag" },
    { label: "Plastic Bags Prevented", value: cause.impactStats?.plasticBagsPrevented || 0, icon: "leaf" },
    { label: "Active Sponsors", value: cause.sponsors?.length || 0, icon: "heart" }
  ];

  // Format the FAQ items
  const faqItems = cause.faqs || [
    { question: "How can I get involved?", answer: "You can sponsor this cause or claim a tote bag to show your support." },
    { question: "Where does my money go?", answer: "Your contribution directly supports the production and distribution of tote bags for this cause." },
    { question: "How many people will this help?", answer: "This cause aims to help thousands of people by providing sustainable alternatives to single-use plastics." },
    { question: "Can I track the impact of my contribution?", answer: "Yes, sponsors receive regular updates on the impact of their contributions." }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <HeroSection 
          title={cause.title}
          tagline={cause.description}
          heroImageUrl={getFullUrl(cause.imageUrl)}
          onAction={handleAction}
          onSponsor={handleSponsor}
          onShare={handleShare}
          isSharing={isSharing}
          status={cause.status}
          targetAmount={cause.targetAmount}
          currentAmount={cause.currentAmount}
          hasSponsorship={hasSponsorship}
        />
        
        <div className="max-w-9xl mx-auto px-8 py-8">
          {/* Breadcrumb */}
          {/* <CauseDetailsBreadcrumb causeTitle={cause.title} /> */}
          
          <div className="max-w-7xl mx-auto gap-8 mb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              {/* <CauseDetailsHeader 
                title={cause.title}
                description={cause.description}
              /> */}

              {/* Sidebar */}
              <div className="lg:col-span-1">
              <CauseDetailsSidebar 
                cause={cause}
              />
              
              {/* Sponsor Showcase */}
              {hasSponsorship && (
                <div className="mt-8">
                  <SponsorShowcase sponsors={cause.sponsors} />
                </div>
              )}
              </div>
              
              {/* Overview Cards */}
              <OverviewCards 
                cause={cause}
              />
              
              {/* Image and Story */}
              {/* <Card>
                <CardContent className="p-6">
                  <CauseImageAndStory 
                    title={cause.title}
                    story={cause.story}
                    imageUrl={getFullUrl(cause.imageUrl)}
                  />
                </CardContent>
              </Card> */}
              
              {/* Detailed Description */}
              <DetailedDescription 
                content={cause.story || ''}
              />
              
              {/* Impact Stats */}
              <ImpactStats stats={impactStats} />
              
              {/* Why It Matters */}
              {/* <WhyItMatters 
                microStoryText={cause.whyItMatters || cause.story || ''}
                microStoryImageUrl={getFullUrl(cause.imageUrl)}
              /> */}

              {/* FAQ Accordion */}
              <FaqAccordion faqs={faqItems} />
            </div>
            
          </div>
          
          {/* Impact Grid */}
          <ImpactGrid 
            items={[
              { icon: "leaf", caption: "Reducing plastic waste in our oceans and landfills" },
              { icon: "users", caption: "Providing resources to those in need" },
              { icon: "refresh-cw", caption: "Creating long-term change through education and action" },
              { icon: "globe", caption: "Making a difference across communities worldwide" }
            ]}
            Icons={{
              'leaf': () => <span className="text-green-500">🌿</span>,
              'users': () => <span className="text-blue-500">👥</span>,
              'refresh-cw': () => <span className="text-purple-500">♻️</span>,
              'globe': () => <span className="text-teal-500">🌎</span>
            }}
          />
          
          {/* Final Callout */}
          <div className="mt-12">
            <FinalCallout 
              title="Join Us Today"
              onAction={handleAction}
              onSponsor={handleSponsor}
              status={cause.status}
              targetAmount={cause.targetAmount}
              currentAmount={cause.currentAmount}
              hasSponsorship={hasSponsorship}
            />
          </div>
        </div>
        
        {/* Sticky Bottom Bar */}
        <StickyBottomBar 
          onAction={handleAction}
          onSponsor={handleSponsor}
          onLearnMore={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          status={cause.status}
          targetAmount={cause.targetAmount}
          currentAmount={cause.currentAmount}
          hasSponsorship={hasSponsorship}
        />
      </div>
    </Layout>
  );
};

export default CauseDetailsPage;

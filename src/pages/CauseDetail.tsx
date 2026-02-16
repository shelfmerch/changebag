import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { fetchCause } from '@/services/apiServices';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/cause-details/HeroSection';
import OverviewCards from '@/components/cause-details/OverviewCards';
import BriefStory from '@/components/cause-details/BriefStory';
import DetailedDescription from '@/components/cause-details/DetailedDescription';
import ImpactStats from '@/components/cause-details/ImpactStats';
import BenefitsSection from '@/components/cause-details/BenefitsSection';
import FaqAccordion from '@/components/cause-details/FaqAccordion';
import SponsorShowcase from '@/components/cause-details/SponsorShowcase';
import FinalCallout from '@/components/cause-details/FinalCallout';
import StickyBottomBar from '@/components/cause-details/StickyBottomBar';
import { useToast } from '@/hooks/use-toast';

const CauseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const { data: cause, isLoading, isError } = useQuery({
    queryKey: ['cause', id],
    queryFn: () => fetchCause(id!),
    enabled: !!id,
  });
  
  // Check if the cause has any sponsors - fix for API response format inconsistency
  const hasSponsorship = cause?.sponsors && cause.sponsors.length > 0 || 
                       cause?.sponsorships && cause.sponsorships.length > 0 ||
                       (cause?.availableTotes && cause.availableTotes > 0);
  
  // Debug sponsorship detection
  console.log('Cause data:', cause);
  console.log('Has sponsorship:', hasSponsorship);

  const handleAction = () => {
    // Navigate to claim page
    navigate(`/claim/${id}?source=direct&ref=cause-detail`);
  };
  
  const handleSponsor = () => {
    // Navigate to sponsor form
    navigate(`/sponsor/new?causeId=${id}`);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this cause with your friends and family.",
      });
    } catch (err) {
      toast({
        title: "Sharing failed",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
    setTimeout(() => setIsSharing(false), 2000);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (isError || !cause) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Cause not found</h1>
            <Button onClick={() => navigate('/causes')}>
              Back to Causes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Mock data for additional sections (would come from API in real app)
  const briefStory = {
    text: "Sarah, a single mother of three, received one of our tote bags during a community outreach event. She now uses it for her weekly grocery trips, eliminating the need for 15-20 plastic bags each month. 'It's amazing how something so simple can make such a difference,' she says.",
    authorName: "Sarah Johnson",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  };

  const impactStats = [
    { label: "People Helped", value: 2450, icon: "users" },
    { label: "Bags Distributed", value: 15600, icon: "shopping-bag" },
    { label: "Plastic Bags Prevented", value: 780000, icon: "leaf" },
    { label: "Active Sponsors", value: 28, icon: "heart" }
  ];

  const benefits = [
    { icon: "droplet", title: "Ocean Protection", description: "Every bag prevents 500+ plastic bags from entering waterways" },
    { icon: "recycle", title: "Sustainable Living", description: "Durable materials that last for years of daily use" },
    { icon: "users", title: "Community Impact", description: "Local distribution creates jobs and builds connections" },
    { icon: "heart", title: "Health Benefits", description: "Reduces exposure to microplastics in our food chain" },
    { icon: "globe", title: "Global Reach", description: "Part of a worldwide movement for environmental change" },
    { icon: "award", title: "Verified Impact", description: "Transparent tracking of every donation and its outcome" }
  ];

  const faqs = [
    {
      question: "How do I know my donation is making a real impact?",
      answer: "We provide complete transparency through our tracking system. You'll receive updates showing exactly how your donation was used, including photos and stories from recipients."
    },
    {
      question: "What materials are the tote bags made from?",
      answer: "Our tote bags are made from 100% organic cotton sourced from certified fair-trade suppliers. They're designed to last for years of regular use."
    },
    {
      question: "Can I specify where my donation goes?",
      answer: "Yes! You can choose to support specific regions or communities during the donation process. We'll ensure your contribution reaches your preferred area."
    },
    {
      question: "How often will I receive updates about the cause?",
      answer: "Donors receive monthly impact reports via email, plus real-time notifications when major milestones are reached. You can adjust your communication preferences anytime."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen">

        <OverviewCards cause={cause} />
        
        <BriefStory story={briefStory} />
        
        <DetailedDescription content={cause.description} />
        
        <ImpactStats stats={impactStats} />
        
        <BenefitsSection benefits={benefits} />
        
        <FaqAccordion faqs={faqs} />
        
        <SponsorShowcase sponsors={cause.sponsors} />
        
        <FinalCallout 
          title={cause.title}
          onAction={handleAction}
          onSponsor={handleSponsor}
          status={cause.status}
          targetAmount={cause.targetAmount}
          currentAmount={cause.currentAmount}
          hasSponsorship={hasSponsorship}
        />
        
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

export default CauseDetail;

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, AlertTriangle, Briefcase, Eye, CheckCircle, Brain, Clock, Smartphone, Factory, HouseIcon, DollarSignIcon, Recycle, Shield, TreePine, Thermometer, MapPin, Scale, TrendingDown, Gift, Megaphone, Globe, Leaf, Users, Heart, ShoppingBag, TrendingUp, Star } from "lucide-react";
import { fetchCause } from '@/services/apiServices';
import { getFullUrl } from '@/utils/apiUtils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

const DynamicCausePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSharing, setIsSharing] = useState(false);

  // Fetch cause data from the API
  const { data: cause, isLoading, error } = useQuery({
    queryKey: ['cause', id],
    queryFn: () => fetchCause(id!),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale to refetch
  });

  // Debug logging
  console.log('DynamicCausePage - Cause data:', cause);
  console.log('DynamicCausePage - Hero title:', cause?.heroTitle);
  console.log('DynamicCausePage - Impact stats:', cause?.impactStats);
  console.log('DynamicCausePage - Progress cards:', cause?.progressCards);
  console.log('DynamicCausePage - FAQs:', cause?.faqs);

  // Development debug panel (only show in development)
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Action handlers
  const handleClaim = () => {
    navigate(`/claim/${id}?source=direct&ref=cause-detail`);
  };
  
  const handleSponsor = () => {
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

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'AlertCircle': AlertCircle,
      'AlertTriangle': AlertTriangle,
      'BriefCase': Briefcase,
      'Factory': Factory,
      'HouseIcon': HouseIcon,
      'Recycle': Recycle,
      'Users': Users,
      'Scale': Scale,
      'Shield': Shield,
      'ShoppingBag': ShoppingBag,
      'Heart': Heart,
      'Eye': Eye,
      'Clock': Clock,
      'Smartphone': Smartphone, 
      'TrendingDown': TrendingDown,
      'TrendingUp': TrendingUp,
      'TreePine': TreePine,
      'Globe': Globe,
      'Leaf': Leaf,
      'Gift': Gift,
      'Megaphone': Megaphone,
      'DollarSignIcon': DollarSignIcon,
      'Thermometer': Thermometer,
      'MapPin': MapPin
    };
    return iconMap[iconName] || Heart;
  };

  // Use dynamic impact stats from database or fallback to generated ones
  const impactStats = cause.impactStats || [
    { 
      icon: "Users", 
      value: cause.availableTotes?.toString() || "0", 
      label: "Bags Available" 
    },
    { 
      icon: "ShoppingBag", 
      value: cause.totalTotes?.toString() || "0", 
      label: "Total Bags Sponsored" 
    },
    { 
      icon: "Heart", 
      value: cause.sponsorships?.length?.toString() || "0", 
      label: "Active Sponsors" 
    },
    { 
      icon: "TrendingDown", 
      value: `${Math.round((cause.currentAmount / cause.targetAmount) * 100)}%`, 
      label: "Funding Progress" 
    }
  ];

  // Use dynamic FAQs from database or fallback to generated ones
  const faqs = cause.faqs || [
    {
      question: "How can I get involved?",
      answer: "You can sponsor this cause or claim a tote bag to show your support."
    },
    {
      question: "Where does my money go?",
      answer: "Your contribution directly supports the production and distribution of tote bags for this cause."
    },
    {
      question: "How many people will this help?",
      answer: `This cause aims to help ${cause.totalTotes || 0} people by providing sustainable alternatives to single-use plastics.`
    },
    {
      question: "Can I track the impact of my contribution?",
      answer: "Yes, sponsors receive regular updates on the impact of their contributions."
    }
  ];

  // Mock partners gallery data
  // const partners = [
  //   {
  //     id: 1,
  //     name: "EcoCorp",
  //     logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  //     description: "Leading environmental solutions provider",
  //     contribution: "₹50,000",
  //     category: "Platinum Partner"
  //   },
  //   {
  //     id: 2,
  //     name: "GreenTech Solutions",
  //     logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  //     description: "Sustainable technology innovations",
  //     contribution: "₹35,000",
  //     category: "Gold Partner"
  //   },
  //   {
  //     id: 3,
  //     name: "NatureFirst",
  //     logo: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  //     description: "Conservation and wildlife protection",
  //     contribution: "₹25,000",
  //     category: "Silver Partner"
  //   },
  //   {
  //     id: 4,
  //     name: "CleanWater Initiative",
  //     logo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  //     description: "Water conservation and purification",
  //     contribution: "₹20,000",
  //     category: "Bronze Partner"
  //   },
  //   {
  //     id: 5,
  //     name: "Sustainable Living Co.",
  //     logo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  //     description: "Eco-friendly lifestyle products",
  //     contribution: "₹15,000",
  //     category: "Supporting Partner"
  //   },
  //   {
  //     id: 6,
  //     name: "Community Care",
  //     logo: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  //     description: "Local community development",
  //     contribution: "₹10,000",
  //     category: "Community Partner"
  //   }
  // ];

  // // Mock testimonials data
  // const testimonials = [
  //   {
  //     id: 1,
  //     name: "Sarah Johnson",
  //     role: "Environmental Activist",
  //     avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  //     content: "This initiative has transformed how our community thinks about plastic waste. The tote bags are not just practical but also beautiful conversation starters about sustainability.",
  //     rating: 5,
  //     company: "Eco Warriors Collective"
  //   },
  //   {
  //     id: 2,
  //     name: "Michael Chen",
  //     role: "Corporate Sustainability Manager",
  //     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  //     content: "As a corporate partner, we've seen incredible engagement from our employees. The transparency in how funds are used and the regular impact updates make this partnership truly meaningful.",
  //     rating: 5,
  //     company: "GreenTech Solutions"
  //   },
  //   {
  //     id: 3,
  //     name: "Priya Patel",
  //     role: "Local Business Owner",
  //     avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  //     content: "I've been using these tote bags in my store for months now. Customers love them and often ask about the cause behind them. It's a win-win for business and the environment.",
  //     rating: 5,
  //     company: "Organic Market"
  //   },
  //   {
  //     id: 4,
  //     name: "David Rodriguez",
  //     role: "Community Leader",
  //     avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  //     content: "The impact on our local community has been remarkable. We've reduced plastic waste by 40% and created awareness about environmental issues. This is exactly what we needed.",
  //     rating: 5,
  //     company: "Neighborhood Association"
  //   },
  //   {
  //     id: 5,
  //     name: "Emma Thompson",
  //     role: "School Principal",
  //     avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  //     content: "Our students are excited about the environmental lessons we've integrated using these tote bags. It's a practical way to teach sustainability and community responsibility.",
  //     rating: 5,
  //     company: "Green Valley School"
  //   },
  //   {
  //     id: 6,
  //     name: "Rajesh Kumar",
  //     role: "Restaurant Owner",
  //     avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
  //     content: "We switched to these tote bags for our takeaway orders and our customers appreciate the eco-friendly approach. It's helped us build a stronger connection with our community.",
  //     rating: 5,
  //     company: "Spice Garden Restaurant"
  //   }
  // ];

  // Get category-specific icon and color
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'environment':
      case 'reforestation':
        return { icon: TreePine, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-800', buttonColor: 'bg-green-600', hoverColor: 'hover:bg-green-700', borderColor: 'border-green-600', bgLight: 'bg-green-100', bgMedium: 'bg-green-200' };
      case 'health':
      case 'mental health':
        return { icon: Heart, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-800', buttonColor: 'bg-red-600', hoverColor: 'hover:bg-red-700', borderColor: 'border-red-600', bgLight: 'bg-red-100', bgMedium: 'bg-red-200' };
      case 'water':
      case 'conservation':
        return { icon: Globe, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-800', buttonColor: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', borderColor: 'border-blue-600', bgLight: 'bg-blue-100', bgMedium: 'bg-blue-200' };
      case 'workplace':
      case 'respect':
        return { icon: Users, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-800', buttonColor: 'bg-purple-600', hoverColor: 'hover:bg-purple-700', borderColor: 'border-purple-600', bgLight: 'bg-purple-100', bgMedium: 'bg-purple-200' };
      case 'plastic':
      case 'waste':
        return { icon: Leaf, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-800', buttonColor: 'bg-green-600', hoverColor: 'hover:bg-green-700', borderColor: 'border-green-600', bgLight: 'bg-green-100', bgMedium: 'bg-green-200' };
      default:
        return { icon: Heart, color: 'primary', bgColor: 'bg-primary-50', textColor: 'text-primary-800', buttonColor: 'bg-primary-600', hoverColor: 'hover:bg-primary-700', borderColor: 'border-primary-600', bgLight: 'bg-primary-100', bgMedium: 'bg-primary-200' };
    }
  };

  const categoryInfo = getCategoryIcon(cause.category);

  return (
    <Layout>
            <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary-50 to-white h-[80vh] sm:h-[70vh] flex items-center justify-center">
          {/* Background Image */}
          <img 
            src={getFullUrl(cause.heroImageUrl || cause.imageUrl) || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
            alt={cause.heroTitle || cause.title}
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 md:py-24 flex flex-col items-center justify-center text-center h-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 w-full max-w-4xl">
              <div className={`inline-flex items-center gap-2 bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-0`}>
                <categoryInfo.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                {cause.category}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {/* {isSharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Megaphone className="h-4 w-4" />
                  )}
                  <span className="ml-2">Share</span> */}
                </Button>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-600 mb-4 sm:mb-6 leading-tight px-4">
              {cause.heroTitle || cause.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl px-4">
              {cause.heroSubtitle || cause.description}
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className={`${categoryInfo.buttonColor} ${categoryInfo.hoverColor} px-8 py-4 text-lg font-semibold`}
                onClick={handleClaim}
              >
               
                🎁 Claim Your Free Bag
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={`${categoryInfo.borderColor} ${categoryInfo.textColor} hover:${categoryInfo.bgColor} px-8 py-4 text-lg font-semibold`}
                onClick={handleSponsor}
              >
                
                📢 Sponsor This Cause
              </Button>
            </div> */}
          </div>
        </section>

       <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Left: Organization Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <span className="h-6 w-6 sm:h-8 sm:w-8 text-green-600">
                     {categoryInfo.icon && <categoryInfo.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${categoryInfo.textColor}`} />}
                  </span>
                </div>
                 <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 px-2 sm:px-4 text-green-600">
                  {cause.heroTitle || cause.title}
                </h1>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed">
                  {cause.heroSubtitle || cause.description}
                </p>

              <div className="space-y-3 sm:space-y-4">
                {/* <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Verified Mental Health Organization</span>
                </div> */}
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  <span className="text-sm sm:text-base text-gray-700">Nationwide, India</span>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">₹{cause.currentAmount?.toLocaleString() || 0}</div>
                  <div className="text-sm sm:text-base text-gray-600">Raised to date</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                      {cause.claimedTotes || 0}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">Sponsors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-16">
  <div className="container mx-auto px-4 sm:px-6">
    <div className="group flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-6xl mx-auto border border-gray-200 p-4 sm:p-6 rounded-lg shadow-sm relative overflow-hidden">
      {/* Tote Bag Image */}
      <div className="flex-shrink-0 animate-fade-in">
        <img 
          src="/images/tote-preview.png"
          alt="Custom tote bag for fundraising"
          className="w-64 h-64 sm:w-80 sm:h-80 object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* Call to Action */}
      <div className="flex-1 text-center lg:text-left animate-fade-in" style={{animationDelay: '0.2s'}}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Design your own Totebag
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
          Get started for free and start fundraising for Mental Health Matters. 
          Create custom bags that promote mental wellness and reduce stigma around mental health.
        </p>
        <Button 
          size="lg" 
          className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg hover:scale-105 transition-all duration-300 shadow-lg"
          onClick={handleSponsor}
        >
          Start Sponsor
        </Button>
      </div>
      {/* Animated background elements */}
      <div className="sm:hidden absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
      <div className="sm:hidden absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
      {/* Green circle bottom right */}
      <div className="hidden sm:block absolute -bottom-16 -right-8 sm:-bottom-20 sm:-right-10 w-40 h-40 sm:w-60 sm:h-60 bg-green-600 rounded-full z-10"></div>
    </div>
  </div>
</section>

      {/* Impact Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
              {cause.impactTitle || "Our Impact"}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {cause.impactSubtitle || `Supporting ${cause.category.toLowerCase()} efforts by tying every sponsored bag to positive change`}
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            {impactStats.map((stat, index) => {
              const IconComponent = getIconComponent(stat.icon);
              return (
                <Card key={index} className="text-center p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 lg:p-4 ${categoryInfo.bgLight} rounded-full`}>
                        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${categoryInfo.textColor}`} />
                      </div>
                    </div>
                    <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${categoryInfo.textColor} mb-2`}>{stat.value}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className={`${categoryInfo.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12`}>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-900">How Each ₹10 Makes a Difference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 ${categoryInfo.bgMedium} rounded-full`}>
                  <Gift className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Quality Bags</h4>
                  <p className="text-gray-700 text-sm sm:text-base">Funds high-quality, durable tote bags that replace single-use plastics</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 ${categoryInfo.bgMedium} rounded-full`}>
                  <categoryInfo.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Cause Support</h4>
                  <p className="text-gray-700 text-sm sm:text-base">Supports {cause.category.toLowerCase()} initiatives and awareness campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={getFullUrl(cause.progressBackgroundImageUrl || cause.imageUrl) || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">
              {cause.progressTitle || "Campaign Progress"}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90">
              {cause.progressSubtitle || "Track our progress towards making a difference"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {cause.progressCards ? (
              // Use dynamic progress cards from database
              cause.progressCards.map((card, index) => {
                const IconComponent = getIconComponent(card.icon);
                return (
                  <div key={index} className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${categoryInfo.textColor}`}>
                        {card.value}
                      </div>
                      <div className={`p-2 sm:p-3 ${categoryInfo.bgLight} rounded-full`}>
                        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{card.title}</div>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">{card.description}</p>
                    {card.additionalInfo && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <span>{card.additionalInfo}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback to default progress cards
              <>
                <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${categoryInfo.textColor}`}>
                      ₹{cause.currentAmount?.toLocaleString() || 0}
                    </div>
                    <div className={`p-2 sm:p-3 ${categoryInfo.bgLight} rounded-full`}>
                      <TrendingDown className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Amount Raised</div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">Out of ₹{cause.targetAmount?.toLocaleString() || 0} target</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${categoryInfo.buttonColor}`}
                      style={{ width: `${Math.min((cause.currentAmount / cause.targetAmount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-2">
                    {Math.round((cause.currentAmount / cause.targetAmount) * 100)}% of goal reached
                  </div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${categoryInfo.textColor}`}>
                      {cause.totalTotes || 0}
                    </div>
                    <div className={`p-2 sm:p-3 ${categoryInfo.bgLight} rounded-full`}>
                      <ShoppingBag className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Bags Sponsored</div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">High-quality tote bags ready for distribution</p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <span className="mr-2">💰</span>
                    <span>₹{cause.currentAmount ? Math.floor(cause.currentAmount / 100) : 0} per bag</span>
                  </div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${categoryInfo.textColor}`}>
                      {cause.sponsorships?.length || 0}
                    </div>
                    <div className={`p-2 sm:p-3 ${categoryInfo.bgLight} rounded-full`}>
                      <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Active Sponsors</div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">Organizations supporting this cause</p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <span className="mr-2">🏢</span>
                    <span>{cause.sponsorships?.filter(s => s.status === 'approved').length || 0} approved</span>
                  </div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-white/20">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${categoryInfo.textColor}`}>
                      {cause.availableTotes || 0}
                    </div>
                    <div className={`p-2 sm:p-3 ${categoryInfo.bgLight} rounded-full`}>
                      <Gift className={`h-5 w-5 sm:h-6 sm:w-6 ${categoryInfo.textColor}`} />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Bags Available</div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base">Ready for claiming by supporters</p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <span className="mr-2">📦</span>
                    <span>{cause.claimedTotes || 0} already claimed</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Additional Progress Info */}
          {/* <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${categoryInfo.buttonColor}`}></div>
                <span className="text-sm font-medium text-gray-700">Campaign Active</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700">Accepting Claims</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">Open for Sponsorship</span>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* How Your Sponsorship Helps - Green Info Box */}
      <section className="py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="rounded-xl sm:rounded-2xl bg-green-50 border border-green-100 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-full bg-green-100 text-green-700">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">How will your sponsorship help?</h3>
                </div>
                <p className="text-gray-700 leading-relaxed py-2 w-full max-w-[52rem] text-sm sm:text-base">
                Your support fuels impactful causes—educating children, providing meals, planting trees, and advancing sustainability. Every tote you sponsor spreads awareness while our vetted NGO partners ensure your contribution creates visible impact for society and the environment.
                </p>
                <div className='flex items-center justify-start gap-3 sm:gap-6 md:gap-10 mt-4 flex-wrap'>
                <img src="/images/sevalaya.jpg" alt="Sponsorship Help" className="w-12 h-12 sm:w-16 md:w-24 object-cover rounded" />
                <img src="/images/isha.jpg" alt="Sponsorship Help" className="w-12 h-12 sm:w-16 md:w-24 object-cover rounded" />
                {/* <img src="/images/sapna.jpg" alt="Sponsorship Help" className="w-16 md:w-24 h-auto" />  */}
                <img src="/images/learning.jpeg" alt="Sponsorship Help" className="w-12 h-12 sm:w-16 md:w-24 object-cover rounded" />
                <img src="/images/jabala.jpg" alt="Sponsorship Help" className="hidden sm:block w-12 h-12 sm:w-16 md:w-24 object-cover rounded" />
                </div>
              </div>
              <div className="flex flex-col items-stretch md:items-center gap-3 sm:gap-4 w-full md:w-64">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full text-sm sm:text-base md:text-lg font-semibold py-2 sm:py-3"
                  onClick={handleSponsor}
                >
                  Sponsor Now
                </Button>
                {/* <Link to="/why-sponsor"> */}
                  <Button onClick={() => navigate('/why-sponsor')} variant="outline" className="w-full p-2 sm:p-3 border-green-600 text-green-700 hover:bg-green-50 text-sm sm:text-base">
                    How sponsorship works
                  </Button>
                {/* </Link> */}
              </div>
            </div>
          </div>
        </section>


        {/* Testimonials */}
        {/* <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">What People Are Saying</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from our community about the impact of this initiative
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.company}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{testimonial.content}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-4 bg-gray-50 px-8 py-4 rounded-full">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-700 font-medium">4.9/5 Average Rating</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{testimonials.length} Verified Reviews</span>
            </div>
          </div>
        </div>
      </section> */}

      {/* FAQs */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                  <AccordionTrigger className="text-left py-4 sm:py-6 text-base sm:text-lg font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 sm:pb-6 text-gray-600 leading-relaxed text-sm sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Partners Gallery */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Trusted Partners</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading organizations and businesses supporting this cause with their commitment to sustainability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                        <p className="text-sm text-gray-600">{partner.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.bgLight} ${categoryInfo.textColor}`}>
                      {partner.category}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contribution</span>
                      <span className={`font-bold ${categoryInfo.textColor}`}>{partner.contribution}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className={`${categoryInfo.borderColor} ${categoryInfo.textColor} hover:${categoryInfo.bgColor} px-8 py-3`}
              onClick={handleSponsor}
            >
              Become a Partner
            </Button>
          </div>
        </div>
      </section> */}

    

      {/* Final CTA */}
      <section className="w-full min-h-[250px] sm:min-h-[300px] bg-gradient-to-r from-green-500 via-green-600 to-black py-12 sm:py-16 flex text-white relative overflow-hidden">
      {/* <section className="w-full min-h-[300px] bg-gradient-to-r from-green-500 via-green-600 to-black py-16 flex items-center justify-center"> */}

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 flex items-center justify-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">
              {cause.ctaTitle || "Join the Movement"}
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90">
              {cause.ctaSubtitle || "Be part of the solution and make a difference today"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg border-2 border-green-600"
                onClick={handleClaim}
              >
                {/* <Gift className="mr-2 h-5 w-5 text-green-600" /> */}
                {"🎁 Claim Your Free Bag"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 text-green-700 hover:text-green-800 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg"
                onClick={handleSponsor}
              >
                {/* <Megaphone className="mr-2 h-5 w-5 text-white" /> */}
                {"📢 Sponsor This Cause"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    
      </div>

      {/* Development Debug Panel */}
      {isDevelopment && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <div className="space-y-1">
            <div>Hero Title: {cause?.heroTitle || 'Not set'}</div>
            <div>Impact Stats: {cause?.impactStats?.length || 0} items</div>
            <div>Progress Cards: {cause?.progressCards?.length || 0} items</div>
            <div>FAQs: {cause?.faqs?.length || 0} items</div>
            <div>CTA Title: {cause?.ctaTitle || 'Not set'}</div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DynamicCausePage;
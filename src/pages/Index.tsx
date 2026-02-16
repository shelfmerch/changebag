import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Target, Sparkles, Users, Search, Star, TrendingUp, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import config from '@/config';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from '@/data/faqs';

interface Cause {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  currentAmount: number;
  targetAmount: number;
  sponsorships?: Array<{ status: string }>;
  imageUrl?: string; // Added for featured causes
  createdAt: string;
}

const HERO_IMAGE = "/images/zero.jpg"; // Placeholder, replace with actual illustration if available

const stats = [
  { number: "1.2M+", label: "Bags in Circulation" },
  { number: "2M+", label: "People Reached" },
  { number: "3000+", label: "Campaign Locations" },
  { number: "100+", label: "Brand Collaborations" },
];

const marketingMethods = [
  {
    method: "Billboard (1 Month)",
    impressions: "4-8 lakh",
    duration: "30 Days",
    cpm: "₹15-₹125",
    engagement: "Passive Viewing",
    sustainability: "❌ None",
    icon: "📺"
  },
  {
    method: "Digital Ads (Google, FB, IG)",
    impressions: "20-30 lakh",
    duration: "2-3 Weeks",
    cpm: "₹33",
    engagement: "Click-Based, Temporary",
    sustainability: "❌ None",
    icon: "💻"
  },
  {
    method: "TV/Print Ads (Single Run)",
    impressions: "5-20 lakh",
    duration: "1 Day/One-Time",
    cpm: "₹50-₹75",
    engagement: "Short-Term Visibility",
    sustainability: "❌ None",
    icon: "📺"
  },
  {
    method: "Event Sponsorships",
    impressions: "3-10 lakh",
    duration: "1-2 Days",
    cpm: "₹15-₹125",
    engagement: "Temporary Engagement",
    sustainability: "❌ None",
    icon: "🎪"
  },
  {
    method: "Change Bag Tote Sponsorship",
    impressions: "1 Crore+ (10K Bags x 1K uses)",
    duration: "Years (Long-Term)",
    cpm: "₹8-₹15 (Lowest)",
    engagement: "Direct, High Retention",
    sustainability: "✅ High (Plastic-Free, Reusable)",
    icon: "🛍️",
    highlighted: true
  }
];


const benefits = [
  {
    icon: <Heart className="h-8 w-8 text-red-400" />,
    title: "Own Your Space",
    description: "Put your brand in people’s hands and everyday life."
  },
  {
    icon: <Target className="h-8 w-8 text-red-400" />,
    title: "Targeted Reach",
    description: "Engage audiences that share your values."
  },
  {
    icon: <Sparkles className="h-8 w-8 text-red-400" />,
    title: "Sustainable Visibility",
    description: "Stay seen through eco-friendly campaigns that last."
  },
  {
    icon: <Users className="h-8 w-8 text-red-400" />,
    title: "Trackable Results",
    description: "Get real-time insights and campaign performance metrics."
  }
];

const journeySteps = [
  {
    id: "step1",
    step: "1",
    title: "Sponsor a Cause",
    description: "Browse dozens of local causes that need your help.",
    // image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&h=300&fit=crop",
    image: "/images/sponsor.png",
    imageAlt: "People browsing causes on laptop"
  },
  {
    id: "step2", 
    step: "2",
    title: "Upload Your Logo",
    description: "Add your brand identity to the cause page.",
    // image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop",
    image: "/images/uplaod.png",
    imageAlt: "Brand logo design on computer"
  },
  {
    id: "step3",
    step: "3", 
    title: "Choose Where to Distribute",
    description: "Select from multiple campaign channels.",
    // image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop",
    image: "/images/distrib.png",
    imageAlt: "Distribution channels and social media"
  },
  {
    id: "step4",
    step: "4",
    title: "Track Your Reach & Impact",
    description: "Get detailed analytics on your campaign's success.",
    // image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    image: "/images/crack.png",
    imageAlt: "Analytics dashboard showing impact metrics"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Ayesha Sharma",
    role: "Environmental Activist",
    avatar: "https://i.pravatar.cc/150?u=ayesha-sharma",
    content: "This initiative has transformed how our community thinks about plastic waste. The tote bags are not just practical but also beautiful conversation starters about sustainability.",
    rating: 5,
    company: "EcoSaarthi Foundation"
  },
  {
    id: 2,
    name: "Arjun Mehta",
    role: "Corporate Sustainability Manager",
    avatar: "https://i.pravatar.cc/150?u=arjun-mehta",
    content: "As a corporate partner, we've seen incredible engagement from our employees. The transparency in how funds are used and the regular impact updates make this partnership truly meaningful.",
    rating: 5,
    company: "GreenTech India"
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Local Business Owner",
    avatar: "https://i.pravatar.cc/150?u=priya-patel",
    content: "I've been using these tote bags in my store for months now. Customers love them and often ask about the cause behind them. It's a win-win for business and the environment.",
    rating: 5,
    company: "Organic Bazaar"
  },
  {
    id: 4,
    name: "Rohan Verma",
    role: "Community Leader",
    avatar: "https://i.pravatar.cc/150?u=rohan-verma",
    content: "The impact on our local community has been remarkable. We've reduced plastic waste by 40% and created awareness about environmental issues. This is exactly what we needed.",
    rating: 5,
    company: "Neighborhood Association India"
  },
  {
    id: 5,
    name: "Neha Gupta",
    role: "School Principal",
    avatar: "https://i.pravatar.cc/150?u=neha-gupta",
    content: "Our students are excited about the environmental lessons we've integrated using these tote bags. It's a practical way to teach sustainability and community responsibility.",
    rating: 5,
    company: "Green Valley School, Mumbai"
  },
  {
    id: 6,
    name: "Rajesh Kumar",
    role: "Restaurant Owner",
    avatar: "https://i.pravatar.cc/150?u=rajesh-kumar",
    content: "We switched to these tote bags for our takeaway orders and our customers appreciate the eco-friendly approach. It's helped us build a stronger connection with our community.",
    rating: 5,
    company: "Spice Garden Restaurant"
  }
];

const partners = [
  { name: "bentley", logo: "/images/bentley.webp" },
  { name: "trustpilot", logo: "/images/trust.svg" },
  { name: "brio", logo: "/images/brio.webp"},
  // { name: "puma", logo: "/images/puma.png" },
  { name: "rubix", logo: "/images/rubix.webp" },
  // { name: "salesforce", logo: "/images/salesforce.png" },
  { name: "jpmorgan", logo: "/images/jp.webp" },
  { name: "cocacola", logo: "/images/cola.webp" },
  // { name: "bmw", logo: "/images/bmw.jpeg" },
  // { name: "walmart", logo: "/images/wallmart.png" },
  { name: "Dr. Reddy's", logo: "/images/reddy.webp" },
  { name: 'google', logo: '/images/google.webp' },
  // { name: 'dominos', logo: '/images/dominos.png' },
  // { name: 'amazon', logo: '/images/amazon.png' },
  // { name: 'apple', logo: '/images/apple.png' },
  // { name: 'meta', logo: '/images/meta.jpg' },
  // { name: 'tesla', logo: '/images/tesla.png' },
  { name: 'sbi', logo: '/images/sbi.png' },
];

const steps = [
  {
    number: "01",
    icon: <Search className="h-8 w-8" />,
    title: "Join the Movement",
    description: "Sign up or scan at partner locations to receive your free ChangeBag."
  },
  {
    number: "02",
    icon: <Heart className="h-8 w-8" />,
    title: "Pick a Purpose",
    description: "Choose a cause that matters — from clean cities to greener living"
  },
  {
    number: "03",
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Carry your Bag",
    description: "Use it daily. Each tote replaces plastic and carries a story of purpose."
  },
  {
    number: "04",
    icon: <Share2 className="h-8 w-8" />,
    title: "Share Your Impact",
    description: "Tag or scan your bag to see your impact and inspire others."
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featuredCauses, setFeaturedCauses] = useState<Cause[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState('');
  
  useEffect(() => {
    const fetchFeaturedCauses = async () => {
      try {
        setFeaturedLoading(true);
        const response = await axios.get(`${config.apiUrl}/causes`, {
          params: { 
            status: 'approved',
            include: 'sponsorships',
            limit: 3,
            featured: true,
            isOnline: true
          }
        });
        setFeaturedCauses(response.data.slice(0, 3));
      } catch (err) {
        setFeaturedError('Failed to load featured causes.');
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedCauses();
  }, []);


    // --- MOCK PAGE ROUTES LOGIC ---
  // Define the mock page routes
  // const mockPageRoutes = [
  //   "/mock/Page3",
  //   "/mock/Page5",
  //   "/mock/Page6",
  //   "/mock/Page4",
  //   "/mock/Page2",
  //   "/mock/Page3",
  // ];

  // Sort causes by createdAt descending and get the 6 most recent
  const sortedCauses = [...featuredCauses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // const mostRecentCauses = sortedCauses.slice(0, mockPageRoutes.length);

  // Map cause _id to mock page route
  // const causeIdToMockPage: Record<string, string> = {};
  // mostRecentCauses.forEach((cause, idx) => {
  //   causeIdToMockPage[cause._id] = mockPageRoutes[idx];
  // });
  
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.apiUrl}/causes`, {
          params: { status: 'approved', include: 'sponsorships', limit: 12 }
        });
        // Only show causes that are unsponsored (no sponsorships or all sponsorships not approved)
        const unsponsored = response.data.filter((cause: Cause) =>
          !cause.sponsorships || !cause.sponsorships.some(s => s.status === 'approved')
        ).slice(0, 3);
        setCauses(unsponsored);
      } catch (err) {
        setError('Failed to load causes.');
      } finally {
        setLoading(false);
      }
    };
    fetchCauses();
  }, []);
  
  // --- Section Components ---

  // Hero Section
  const HeroSection = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 lg:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/10 to-emerald-100/10"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/20 rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-200/20 rounded-full translate-x-40 translate-y-40 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-green-300/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Sponsor Change – Make an Impact
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                A New-Age Medium for Real-World Branding{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                No more TV ads, billboards, or print ads.
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            ChangeBag turns everyday bags into sustainable, high-visibility campaigns - where your brand is carried, seen, and remembered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
                onClick={() => navigate('/causes')}
              >  
                Start Sponsoring
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg rounded-xl font-semibold transition-all duration-300 hover:border-green-700"
                onClick={() => navigate('/why-sponsor')}
              >
                Learn More
              </Button>
            </div>
            
            {/* Trust indicators */}
            {/* <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Trusted by 300+ Brands</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-sm font-medium text-gray-700">1M+ Impressions</span>
              </div>
            </div> */}
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden transform group-hover:scale-105 transition-all duration-500">
              <img 
                src={HERO_IMAGE} 
                alt="Woman holding a sustainable no plastic bag"
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-medium text-gray-800">Sustainable Impact</span>
              </div>
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                Eco-Friendly
              </div>
            </div>
            
            {/* Floating elements around the image */}
            <div className="absolute -top-4 -left-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-bounce">
              Free Totes
            </div>
            <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
              Brand Visibility
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // const RaiseFundsSection=()=>(
  //   <section className="bg-[#f8faf8] py-16 px-8">
  //     <div className="max-w-6xl mx-auto">
  //       <div className="grid md:grid-cols-2 gap-12 items-center">
  //         <div className="space-y-6">
  //           <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
  //             Raise funds for your cause!
  //           </h1>
            
  //           <p className="text-lg text-gray-600 leading-relaxed">
  //             Onboard on Give.do and create impact by raising funds for your initiatives
  //           </p>
            
  //           <div className="flex flex-col sm:flex-row gap-4 pt-4">
  //             <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white text-base px-8 py-3 rounded-lg">
  //               Enroll your NGO on give
  //             </Button>
  //             <Button size="lg" variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-50 text-base px-8 py-3 rounded-lg">
  //               Raise funds for a listed NGO
  //             </Button>
  //           </div>
  //         </div>
          
  //                     <div className='h-full'>
  //             <img 
  //               src="/images/header.png" 
  //               alt="Children fundraising activities" 
  //               className="w-full h-full object-cover"
  //             />
  //         </div>
  //       </div>
  //     </div>
  //   </section>
  // )

  // Why Brands Sponsor Section
  const WhySponsorSection = () => (
    <section className="bg-gradient-to-br from-white via-green-50/30 to-white py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/5 to-emerald-100/5"></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-green-200/20 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-emerald-200/20 rounded-full translate-x-12 translate-y-12"></div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Why Choose CauseConnect
          </div> */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why brands choose <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Changebag</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We help brands launch, manage, and scale real-world visibility campaigns with sustainable reach and measurable results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center text-center shadow-lg border border-green-100/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-green-200"
            >
              <div className="mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 w-20 h-20 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(benefit.icon, { className: 'h-12 w-12 text-green-600 group-hover:text-emerald-600 transition-colors duration-300' })}
              </div>
              <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-green-700 transition-colors duration-300">{benefit.title}</h3>
              <p className="text-gray-600 text-base leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Featured Causes Section
  const FeaturedCausesSection = () => (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Causes that need you <span className="text-green-600">right now</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            These high-impact causes are looking for brand partners who are ready to make a meaningful difference in the world.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredLoading ? (
            [1,2,3].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-100"></Card>
            ))
          ) : featuredError && featuredCauses.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
              <p className="text-gray-500 mb-6">{featuredError}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : (
            featuredCauses.map((cause) => {
              const isFullyFunded = (cause.currentAmount || 0) >= cause.targetAmount;
              const hasApprovedSponsorship = cause.sponsorships?.some(s => s.status === 'approved');
              return (
                <Card key={cause._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div 
                    className="cursor-pointer" 
                    onClick={() => {
                      // if (causeIdToMockPage[cause._id]) {
                      //   navigate(causeIdToMockPage[cause._id]);
                      // } else {
                        navigate(`/cause/${cause._id}`);
                      // }
                    }}
                    // onClick={() => navigate(`/cause/${cause._id}`)}
                    title={`View details for ${cause.title}`}
                  >
                    <img 
                      src={getImageUrl(cause.imageUrl)} 
                      alt={cause.title} 
                      className="w-full h-48 object-cover hover:opacity-90 transition-opacity" 
                      onError={handleImageError}
                    />
                  </div>
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{cause.title}</h3>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {cause.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 flex-1">
                      {cause.description.length > 120 
                        ? `${cause.description.substring(0, 120)}...` 
                        : cause.description}
                    </p>
                    {/* <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
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
                    {hasApprovedSponsorship ? (
                      <Button 
                        onClick={() => navigate(`/claim/${cause._id}?source=direct&ref=homepage`)} 
                        className="w-full bg-black text-white mb-2"
                      >
                        Claim a Tote
                      </Button>
                    ) : null}
                    {!isFullyFunded && (
                      <Button 
                        onClick={() => navigate(`/sponsor/new?causeId=${cause._id}`)} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white mb-2"
                      >
                        Sponsor This Cause
                      </Button>
                    )}
                    {!hasApprovedSponsorship && !isFullyFunded && (
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/waitlist/${cause._id}`)} 
                        className="w-full bg-white text-black border border-green-600"
                      >
                        Join Waitlist
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
            )}
          </div>
          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('/causes')} 
              variant="outline" 
              size="lg"
            className="border-green-600 text-green-600 hover:bg-green-50"
            >
              View All Causes
            </Button>
          </div>
        </div>
      </section>
  );

  const PartnersSection = () => (
    <section id="partners" className="bg-gradient-to-br from-gray-50 via-white to-green-50/30 py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/5 to-emerald-100/5"></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-green-200/20 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-emerald-200/20 rounded-full translate-x-12 translate-y-12"></div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Corporate Partners</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Trusted by the largest brands and corporations, and the most impactful foundations around the world
          </p>
        </div>
        
        {/* Infinite Carousel */}
        <div className="relative">
          {/* First row - moving left */}
          <div className="flex animate-scroll-left">
            {[...partners, ...partners].map((partner, index) => (
              <div 
                key={`${partner.name}-${index}`}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center flex items-center justify-center hover:scale-105 flex-shrink-0 mx-4"
                style={{ minWidth: '200px' }}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // Journey/How It Works Section (Enhanced for Mobile)
  const JourneySection = () => {
    const [activeStep, setActiveStep] = React.useState(journeySteps[0].id);
    const currentStep = journeySteps.find(s => s.id === activeStep) || journeySteps[0];

    return (
      <section className="bg-gradient-to-br from-white via-green-50/20 to-white py-12 md:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              From Purpose to Impact: <span className="text-green-600">The ChangeBag Journey</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Follow our simple 4-step process to create meaningful impact while building your brand presence
            </p>
          </div>

          {/* Mobile: Enhanced horizontal stepper */}
          <div className="block md:hidden">
            {/* Progress Bar */}
            

            {/* Current Step Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden mx-4">
              <div className="relative">
                <img
                  src={currentStep.image}
                  alt={currentStep.imageAlt}
                  className="w-full h-48 md:h-64 object-contain md:object-cover bg-white"
                  onError={(e) => {
                    e.currentTarget.src = "/images/sponsorcause.png";
                  }}
                />
                <div className="absolute top-3 left-3 md:top-4 md:left-4">
                  {/* <div className="bg-green-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm">
                    Step {currentStep.step}
                  </div> */}
                </div>
              </div>
              {/* <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">{currentStep.title}</h3>
                <p className="text-gray-600 text-sm md:text-lg leading-relaxed">{currentStep.description}</p>
              </div> */}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-4 md:mt-6 space-x-2 px-4">
              {journeySteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    activeStep === step.id ? 'bg-green-600 scale-125' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Mobile Step Navigation */}
            <div className="mt-6 px-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const currentIndex = journeySteps.findIndex(s => s.id === activeStep);
                    if (currentIndex > 0) {
                      setActiveStep(journeySteps[currentIndex - 1].id);
                    }
                  }}
                  disabled={journeySteps.findIndex(s => s.id === activeStep) === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    journeySteps.findIndex(s => s.id === activeStep) === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {journeySteps.findIndex(s => s.id === activeStep) + 1} of {journeySteps.length}
                </span>
                <button
                  onClick={() => {
                    const currentIndex = journeySteps.findIndex(s => s.id === activeStep);
                    if (currentIndex < journeySteps.length - 1) {
                      setActiveStep(journeySteps[currentIndex + 1].id);
                    }
                  }}
                  disabled={journeySteps.findIndex(s => s.id === activeStep) === journeySteps.length - 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    journeySteps.findIndex(s => s.id === activeStep) === journeySteps.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Desktop: Enhanced vertical layout */}
          <div className="hidden md:flex flex-row items-stretch gap-8 lg:gap-12">
            {/* Left: Enhanced Steps */}
            <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 lg:p-8">
                <div className="space-y-4 lg:space-y-6">
                  {journeySteps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Progress Line */}
                      {index < journeySteps.length - 1 && (
                        <div className={`absolute left-6 top-16 w-0.5 h-12 transition-all duration-500 ${
                          index < journeySteps.findIndex(s => s.id === activeStep) 
                            ? 'bg-green-500' 
                            : 'bg-gray-200'
                        }`}></div>
                      )}
                      
                      <button
                        onClick={() => setActiveStep(step.id)}
                        className={`w-full text-left p-4 lg:p-6 rounded-xl transition-all duration-300 group ${
                          activeStep === step.id 
                            ? 'bg-green-50 border-2 border-green-200 shadow-lg transform scale-105' 
                            : 'bg-gray-50 border-2 border-transparent hover:bg-green-50/50 hover:border-green-100'
                        }`}
                      >
                        <div className="flex items-start gap-3 lg:gap-4">
                          {/* Step Number */}
                          <div className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-lg font-bold transition-all duration-300 ${
                            activeStep === step.id 
                              ? 'bg-green-600 text-white shadow-lg' 
                              : index < journeySteps.findIndex(s => s.id === activeStep)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 group-hover:bg-green-100'
                          }`}>
                            {step.step}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className={`text-lg lg:text-xl font-bold mb-1 lg:mb-2 transition-colors duration-300 ${
                              activeStep === step.id ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                              {step.description}
                            </p>
                          </div>
                          
                          {/* Active Indicator */}
                          {activeStep === step.id && (
                            <div className="flex-shrink-0">
                              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-600 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Enhanced Image Display */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden transform group-hover:scale-105 transition-all duration-500">
                  <div className="relative">
                    <img
                      src={currentStep.image}
                      alt={currentStep.imageAlt}
                      className="w-full max-w-2xl lg:max-w-4xl h-[400px] lg:h-[600px] object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/sponsoracause.png";
                      }}
                    />
                    <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 lg:px-4 lg:py-2 rounded-full font-medium text-xs lg:text-sm shadow-lg">
                        {currentStep.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          {/* <div className="text-center mt-12 md:mt-16">
            <Button 
              onClick={() => navigate('/causes')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Journey
            </Button>
          </div> */}
        </div>
      </section>
    );
  };
  
  // How Change Spreads Section (Enhanced for Mobile)
  const SpreadSection = () => (
    <section className="bg-white py-20 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Change <span className="text-green-600">Spreads</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our multi-channel approach ensures your message reaches the right audience through various touchpoints
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Website & Social Media */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-2">
            <div className="mb-4 flex items-center justify-center rounded-full bg-green-50 w-16 h-16">
              {/* Globe/Share Icon */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-green-600">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-2 text-center text-gray-900">Website & Social Media</h3>
            <p className="text-gray-600 text-base text-center">Engaging campaigns that go viral through strategic social media presence and compelling web content.</p>
          </div>

          {/* YouTuber Network */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-2">
            <div className="mb-4 flex items-center justify-center rounded-full bg-green-50 w-16 h-16">
              {/* YouTube Play Icon */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-green-600">
                <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                <polygon points="10,9 16,12 10,15" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-2 text-center text-gray-900">YouTuber Network</h3>
            <p className="text-gray-600 text-base text-center">100M+ subscribers, 50M+ views for massive reach through trusted influencer partnerships.</p>
          </div>

          {/* Change Pickup Points */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-2">
            <div className="mb-4 flex items-center justify-center rounded-full bg-green-50 w-16 h-16">
              {/* Map Pin Icon */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-green-600">
                <path d="M12 21s6-5.686 6-10A6 6 0 0 0 6 11c0 4.314 6 10 6 10z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-2 text-center text-gray-900">Change Pickup Points</h3>
            <p className="text-gray-600 text-base text-center">Malls, cafes, key city junctions - strategically placed pickup points for maximum visibility.</p>
          </div>

          {/* E-commerce Tie-ups */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-2">
            <div className="mb-4 flex items-center justify-center rounded-full bg-green-50 w-16 h-16">
              {/* Shopping Bag Icon */}
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="text-green-600">
                <path d="M6 7V6a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="2"/>
                <rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 11v2m6-2v2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-2 text-center text-gray-900">E-commerce Tie-ups</h3>
            <p className="text-gray-600 text-base text-center">Available on BookMyShow, MakeMyTrip, and more - integrated into popular e-commerce platforms.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">100M+</div>
            <div className="text-gray-600 font-medium">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50M+</div>
            <div className="text-gray-600 font-medium">Views</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Pickup Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">10+</div>
            <div className="text-gray-600 font-medium">Platforms</div>
          </div>
        </div>
      </div>
    </section>
  );

  const Testimonials = () => (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-gray-900">What People Are Saying</h2>
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
                    {/* <p className="text-xs text-gray-500">{testimonial.company}</p> */}
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
        
        {/* <div className="text-center mt-12">
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
        </div> */}
      </div>
    </section>
  );

  // Join the Movement CTA
  const JoinCTASection = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-800 py-8 lg:py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-40 translate-y-40 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Join the Movement
          </div> */}
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Ready to join the <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">movement?</span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Whether you're a brand looking for authentic reach or someone who loves free, useful things that matter – Changebag is for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => navigate('/causes')}
              aria-label="Join Now"
            >
              Sponsor Now
            </Button>
            <Button 
              variant="outline"
              className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              
              onClick={() => navigate('/why-sponsor')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );

  const StoriesSection = () => (
    <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-4xl font-bold text-green-600 mb-4">
          The Most Budget-Friendly CSR & Brand Awareness Strategy
        </h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
          With ChangeBag.org's tote sponsorship, brands achieve enduring visibility, enhanced consumer 
          engagement, and cost-effective marketing while promoting sustainability. Unlike temporary ads, 
          tote bags serve as daily-use items, providing years of continuous brand promotion and generating 
          millions of impressions from a single investment.
        </p>
      </div>

      <div className="overflow-x-auto mb-12">
        <div className="border-2 border-black-200 rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <th className="px-6 py-4 text-left font-semibold border-r border-green-500">Marketing Method</th>
                <th className="px-6 py-4 text-left font-semibold border-r border-green-500">Impressions</th>
                <th className="px-6 py-4 text-left font-semibold border-r border-green-500">Duration</th>
                <th className="px-6 py-4 text-left font-semibold border-r border-green-500">CPM</th>
                <th className="px-6 py-4 text-left font-semibold border-r border-green-500">Engagement</th>
                <th className="px-6 py-4 text-left font-semibold">Sustainability Impact</th>
              </tr>
            </thead>
            <tbody>
              {marketingMethods.map((method, index) => (
                <tr 
                  key={index}
                  className={`border-b border-black-200 ${
                    method.highlighted 
                      ? 'bg-black-50/80 border-black-200' 
                      : 'bg-white hover:bg-black-50/30'
                  } transition-all duration-300`}
                >
                  <td className="px-6 py-4 border-r border-black-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className='font-medium text-gray-900'>
                        {method.method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 border-r border-black-100">{method.impressions}</td>
                  <td className="px-6 py-4 text-gray-600 border-r border-black-100">{method.duration}</td>
                  <td className="px-6 py-4 text-gray-600 border-r border-black-100">{method.cpm}</td>
                  <td className="px-6 py-4 text-gray-600 border-r border-black-100">{method.engagement}</td>
                  <td className="px-6 py-4 text-gray-600">{method.sustainability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* <div className="text-center">
        <Button size="lg" className="bg-primary hover:bg-accent text-lg px-8 py-3">
          Partner with Us for Sustainable Impact
        </Button>
      </div> */}
    </div>
  </section>
);

  const FaqSection = () => (
    <section id="faq" className="bg-gradient-to-br from-white via-green-50/20 to-white py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/5 to-emerald-100/5"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-green-200/20 rounded-full translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-emerald-200/20 rounded-full -translate-x-16 translate-y-16"></div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Frequently Asked Questions
            </div> */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Got <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Questions?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about our initiatives. If you have any other questions please reach out to us at:{" "}
              {/* <a href="mailto:support@changebag.org" className="text-green-600 hover:text-green-800 font-medium transition-colors duration-300">
                support@changebag.org
              </a> */}
               <a
    href="https://mail.google.com/mail/?view=cm&fs=1&to=support%40changebag.org&su=support%20request&body=Hi%20team%2C%0A"
    target="_blank"
    rel="noopener noreferrer"
    className="text-green-400 font-medium"
  >
    support@changebag.org
  </a>
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 animate-fade-in hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-green-50/50 rounded-xl transition-all duration-300">
                  <span className="text-lg font-medium text-gray-900 pr-4 group-hover:text-green-700 transition-colors duration-300">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );

  const StatsSection=()=>(
    <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-200/30 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-200/30 rounded-full translate-x-20 translate-y-20"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="mb-12">
          {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-lg font-bold mb-8 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            give.do
          </div> */}
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            India's most trusted on-ground<br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              brand activation platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Empowering brands to make real-world impact through sustainable, visible, and community-driven campaigns.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust indicators */}
        {/* <div className="mt-16 pt-8 border-t border-green-200/50">
          <p className="text-sm text-gray-500 mb-4">Trusted by millions across India</p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );

  const HowItWorksSection = () => (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Carry the <span className="text-[#008037]">Change</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join the movement. Get a free tote, support a cause, and go greener.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                  <div className="text-[#008037] text-6xl font-bold mb-4 opacity-20">
                    {step.number}
                  </div>
                  <div className="text-[#008037] mb-6 flex justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  // --- Render ---
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <FeaturedCausesSection />
      <WhySponsorSection />
      <JourneySection />
      {/* <RaiseFundsSection /> */}
      <HowItWorksSection />
      {/* <StoriesSection /> */}
      <JoinCTASection />
      <Testimonials />
      <PartnersSection />
      <hr />
      <FaqSection />
      
    </Layout>
  );
};

export default Index;

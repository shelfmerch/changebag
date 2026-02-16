
import React, {useState, useEffect, useMemo} from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Users, Award, BadgeCheck, HandHeart, Leaf, ShieldCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import { LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';
import { fetchDashboardMetrics } from '@/services/apiServices';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fetchStats, fetchClaimStories } from '@/services/apiServices';
import { Story } from '@/models/Story';
import {galleryItems} from '@/data/galleryItems'; // Assuming you have a separate file for gallery items
import Index from './Index';

const scrollToStats = () => {
  const element = document.getElementById('stats');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};


const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1', '#F472B6', '#34D399'];

// Sample data for the impact chart (fallback if API data is not available)
const fallbackImpactData = [
  { cause: 'Environmental', bags: 480 },
  { cause: 'Social Justice', bags: 320 },
  { cause: 'Education', bags: 260 },
  { cause: 'Animal Welfare', bags: 190 },
  { cause: 'Hunger Relief', bags: 350 },
];

const cards = [
  {
    id: 1,
    bgColor: 'bg-emerald-700',
    textColor: 'text-white',
    accentColor: 'text-emerald-200',
    lightTextColor: 'text-emerald-100',
    stat: '50%+',
    statDescription: 'of our B Corp progress is in the environmental category',
    title: 'Commitment to the Planet',
    description: 'Making gains on our sustainability goals.'
  },
  {
    id: 2,
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    accentColor: 'text-green-200',
    lightTextColor: 'text-green-100',
    stat: '81.5K',
    statDescription: 'TOMS Products Recycled Since 2014',
    title: 'Threduo',
    description: 'Our in-house resale platform.'
  },
  {
    id: 3,
    bgColor: 'bg-teal-700',
    textColor: 'text-white',
    accentColor: 'text-teal-200',
    lightTextColor: 'text-teal-100',
    stat: 'Employees Making an Impact',
    statDescription: 'Closing our global offices annually for our team to make an impact in our communities.',
    title: 'Volunteering',
    description: ''
  },
  {
    id: 4,
    bgColor: 'bg-emerald-600',
    textColor: 'text-white',
    accentColor: 'text-emerald-200',
    lightTextColor: 'text-emerald-100',
    stat: 'Ongoing Commitment to Learning',
    statDescription: 'Committed to being an ongoing anti-racist organization.',
    title: 'Dedicated to Learning',
    description: ''
  }
];

const WhyClaim = () => {

  const [metrics, setMetrics] = useState<any>(null);
  // const [stats, setStats] = useState<any>(null);

  useEffect(()=>{
  const fetchData = async () => {
  const [metricsData, statsData] = await Promise.all([
    fetchDashboardMetrics(),
    fetchStats()
  ]);
  setMetrics(metricsData);
  // setStats(statsData);
  };
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats
  });

  const { data: stories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ['claim-stories'],
    queryFn: fetchClaimStories
  });

  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    if (isIntersecting) {
      galleryItems.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, index]);
        }, index * 100);
      });
    }
  }, [isIntersecting]);

  const toggleStoryExpansion = (storyId: string) => {
    setExpandedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  };
  // Use real impact data from API or fallback to sample data
  const impactData = stats?.impactData || fallbackImpactData;
  
  const totalbagsponsored = useCounterAnimation({
    target: stats?.totalBagsSponsored || 0,
    duration: 2000,
    isTriggered: isIntersecting,
  });

  const totalbagclaimed = useCounterAnimation({
    target: stats?.totalBagsClaimed || 0,
    duration: 2000,
    isTriggered: isIntersecting,
  });

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Static images for Featured Stories Carousel (WhyClaim)
  const storyImages = [
    '/images/story4.png',
    '/images/story5.png',
    '/images/story6.png',
  ];

  const formatBags = (num: number) => {
    if (num > 999) {
      return `${Math.floor(num / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
    }
    return num;
  };

  // bubble chart logic
  const categoryData = stats?.impactData?.map((item: any, idx: number) => ({
    name: item.cause,
    value: item.bags,
    color: COLORS[idx % COLORS.length]
  })) || [];

  const clamp = (min: number, val: number, max: number) => Math.max(min, Math.min(val, max));
  const diameterFromShare = (share: number, minD = 48, maxD = 288) => {
  // area-proportional sizing: radius ∝ sqrt(share)
  const minR = minD / 2, maxR = maxD / 2;
  const r = Math.sqrt(Math.max(share, 0)) * (maxR - minR) + minR;
  return Math.round(clamp(minD, r * 2, maxD));
};  

  const total = useMemo(
    () => categoryData.reduce((sum, cat) => sum + Number(cat.value || 0), 0),
    [categoryData]
  );

  return (
    <Layout>
    {/* Hero Section */}
      <section className="relative overflow-hidden h-[100vh] sm:h-[90vh]" id="hero">
      {/* Parallax background */}
      <div 
        className="absolute inset-0 parallax-hero" 
      >
        <img src='/images/claim-header.jpg' alt='claim-header' className='w-full h-full object-cover object-top sm:object-cover' />
        {/* Masked blur overlay on left third */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="h-full w-1/3 backdrop-blur-[10px]"
            style={{
              maskImage: 'linear-gradient(to right, black, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, black, transparent)'
            }}
          ></div>
        </div>
        <div className="absolute inset-0 image-overlay"></div>
      </div>
      
      {/* Floating particles animation */}
      {/* <div className="absolute inset-0 pointer-events-none">
        <div className="animate-float absolute top-1/4 left-1/4 w-2 h-2 bg-white opacity-30 rounded-full"></div>
        <div 
          className="animate-float absolute top-1/3 right-1/4 w-1 h-1 bg-toms-cyan opacity-40 rounded-full" 
          style={{ animationDelay: '1s' }}
        ></div>
        <div 
          className="animate-float absolute bottom-1/3 left-1/3 w-3 h-3 bg-toms-green opacity-20 rounded-full" 
          style={{ animationDelay: '2s' }}
        ></div>
      </div> */}
      
      {/* Content */}
       <div className="relative z-10 flex flex-col justify-center items-start h-full px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-4xl w-full">
          <h1 className="ml-10 text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            The Power of Your
            <span className="block text-white">Claim</span>
          </h1>
          <p className="ml-10 text-xl sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            Every purchase you make creates positive change. Join our community of changemakers supporting education, mental health, and equality worldwide.
          </p>
          <button 
            onClick={scrollToStats}
            className="ml-10 bg-green-700 hover:bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg animate-fade-in-up inline-flex items-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
            style={{ animationDelay: '0.6s' }}
          >
            <span>Explore Our Impact</span>
            <i className="fas fa-arrow-down"></i>
          </button>
        </div>
      </div>
      
      </section>

    {/* Impact Gallery */}
    {/* <section ref={targetRef} className="py-20 bg-gradient-to-br from-white to-green-50" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-green-800 mb-6 drop-shadow-sm">
            Measured by the Company We Keep
          </h2>
          <p className="text-xl font-semibold text-gray-700 max-w-4xl mx-auto leading-relaxed">
            We carefully vet Giving Partners that are proven to help make "good" happen on the ground. Without them, our giving would not be possible. In 2024, we supported 32 Giving Partners in 7 countries. Here are a few:
          </p>
        </div>
        
        Masonry Grid
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryItems.map((item, index) => (
            <div 
              key={item.id}
              className={`break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-xl card-hover transition-all duration-700 transform ${
                visibleItems.includes(index) 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-xl text-gray-800 mb-2">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section> */}

     {/* Impact Data Visualization */}
     <section className="py-20 bg-white" id="impact-data">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-green-800 mb-6 drop-shadow-sm">
            We Supported Multiple Causes This Year
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our impact spans across various causes, creating positive change in communities worldwide.
          </p>
        </div>

        {/* Total Beneficiaries Display */}
        {/* <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-full shadow-lg">
            <span className="text-3xl font-bold">2,64,630</span>
            <span className="text-lg ml-2">Beneficiaries</span>
          </div>
        </div> */}

        {/* Bubble Chart Container */}
        <div className="relative mb-12">
          <div className="flex justify-center items-center min-h-[400px] relative">
           {/* Bubble Chart */}
            <div className="relative w-full max-w-6xl h-96">
           
          <div className="relative w-full h-[400px]">
            {categoryData.slice(0,7).map((category, index) => {

            const share = total ? Number(category.value) / total : 0;
            const size = diameterFromShare(share); // px
            const percentage = (share * 100).toFixed(1);

            const positions = [
              { top: '50%', left: '50%' },
              { top: '18%', left: '32%' },
              { top: '34%', left: '18%' },
              { top: '78%', left: '36%' },
              { top: '70%', left: '65%' },
              { top: '28%', left: '64%' },
              { top: '40%', left: '80%' },
            ];

    return (
      <div
        key={index}
        className="absolute flex flex-col items-center"
        style={{
          top: positions[index]?.top || '50%',
          left: positions[index]?.left || '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="rounded-full flex items-center justify-center text-white font-bold shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: category.color,
          }}
        >
          {percentage}%
        </div>
        <div className="text-center mt-2">
          <p className="font-semibold text-gray-800">{category.name}</p>
          <p className="text-sm text-gray-600">
            {Number(category.value).toLocaleString()} Beneficiaries
          </p>
        </div>
      </div>
    );
  })}
</div>
            </div>
          </div>
        </div>

        {/* Legend */}

          {/* <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-semibold">Education: 54.9% (1,45,192)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-semibold">Healthcare: 5.3% (13,958)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span className="font-semibold">Livelihood & Sports: 0.08% (712)</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-semibold">Animals: 21.4% (56,642)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-300 rounded-full"></div>
              <span className="font-semibold">Environment: 5.2% (13,717)</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              <span className="font-semibold">Social Protection: 9.5% (25,036)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
              <span className="font-semibold">Disaster Relief: 3.5% (9,373)</span>
            </div>
          </div> */}

          <div className='flex flex-row items-center gap-8 justify-center flex-wrap mt-8'>
            {categoryData.slice(0, 7).map((category,index)=>{
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }} 
                  ></div>
                  <span className="font-semibold">
                    {category.name}: {Number(category.value).toLocaleString()} ({((category.value / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Time Period Selector */}
        {/* <div className="flex justify-center">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button className="px-6 py-3 text-white rounded-md transition-all duration-300 hover:bg-gray-700">
              2024-2025
            </button>
            <button className="px-6 py-3 bg-red-500 text-white rounded-md transition-all duration-300 hover:bg-red-600">
              MID YEAR
            </button>
            <button className="px-6 py-3 text-white rounded-md transition-all duration-300 hover:bg-gray-700">
              YEAR-END
            </button>
          </div>
        </div> */}
      
    </section>

    {/* Animated Cards Section */}
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50" id="animated-cards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
            Our Impact in Motion
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover how every TOMS purchase creates ripples of positive change across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Animated Card 1 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 p-8 text-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <Heart className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-100 transition-colors duration-300 text-center">
                Total Causes
              </h3>
              <div className="flex flex-col items-center justify-between">
                <span className="text-7xl font-bold">{stats?.totalCauses || 0}</span>
                  <p className="text-emerald-100 mb-6 mt-3 leading-relaxed">
                    Partnering for Positive Change.
                  </p>
              </div>
              
            </div>
          </div>

          {/* Animated Card 2 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 p-8 text-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <Users className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-100 transition-colors duration-300 text-center">
                Total Sponsors
              </h3>
              <div className="flex flex-col items-center justify-between">
                <span className="text-7xl font-bold">{stats?.totalBagsSponsored || 0}</span>
                  <p className="text-emerald-100 mb-6 mt-3 leading-relaxed">
                    Currently making an impact
                  </p>
              </div>
            </div>
          </div>

          {/* Animated Card 3 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 p-8 text-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <Leaf className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-100 transition-colors duration-300 text-center">
                Total Claims
              </h3>
              <div className="flex flex-col items-center justify-between">
                <span className="text-7xl font-bold">{stats?.totalBagsClaimed || 0}</span>
                  <p className="text-emerald-100 mb-6 mt-3 leading-relaxed">
                    Eco-friendly totes with purpose
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2">
            <span>Join Our Mission</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div> */}
      </div>
    </section>

    {/* Branded Impact Section */}
    <section className="py-20 bg-white" id="branded-impact">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      {/* Left Side - Branded Items */}
      <div className="w-full flex justify-center mb-8 lg:mb-0">
        <img src="/images/sponsor.png" alt="sponsor" className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto object-cover rounded-xl shadow-md" />
      </div>
      {/* Right Side - Content */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          PUT YOUR IMPACT IN EVERYONE'S HANDS™
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
          Receive meaningful connections and utilize the greatest social impact platform in the conscious consumer industry. Every TOMS purchase creates positive change.
        </p>
        <button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2">
        <Link to='/'>
          <span>Get Started Today</span>
          <i className="fas fa-arrow-right"></i>
        </Link>
        </button>
      </div>
    </div>
  </div>
    </section>

    {/* Stats Section */}
    <section ref={targetRef} className="relative py-10 overflow-hidden my-8" id="stats">
      {/* Background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 w-full shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/5 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Turning Tote Bags into Social Impact
          </h2>
          <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
          Every bag you claim goes beyond carrying essentials—it funds education for children, supports sustainable livelihoods for artisans, and delivers hope directly into the hands of those who need it most.
          </p>
        </div>
        
        {/* Statistics */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* 105M+ Stat */}
          <div className="text-center transform transition-all duration-500 hover:scale-105 backdrop-blur-sm rounded-2xl">
            <div className={`counter-animation text-6xl md:text-8xl font-bold text-white mb-2 drop-shadow-lg ${
              isIntersecting ? 'animate-counter' : ''
            }`}>
              {formatBags(totalbagsponsored)}
            </div>
            <p className="text-xl text-white/90 font-medium">
              Total Bags Sponsored
            </p>
          </div>
          
          {/* 100M+ Stat */}
          <div className="text-center transform transition-all duration-500 hover:scale-105 backdrop-blur-sm rounded-2xl">
            <div className={`counter-animation text-6xl md:text-8xl font-bold text-white mb-2 drop-shadow-lg ${
              isIntersecting ? 'animate-counter' : ''
            }`}>
              {totalbagclaimed}
            </div>
            <p className="text-xl text-white/90 font-medium">
              Total Bags Claimed
            </p>
          </div>
        </div>
      </div>
    </section>


    {/* Beyond the Check */}
    <section className="py-20 bg-gradient-to-br from-[#f7f6f4] to-green-50" id="beyond-check">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-green-800 mb-6 drop-shadow-sm">
            Beyond the Check
          </h2>
          <p className="text-xl font-semibold text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Through our volunteer work, product donations and lasting connections over the years, our support has grown well beyond financial contributions. Here are some of the ways we walk the walk (in stylishly comfortable shoes, of course).
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => (
            <div 
              key={card.id}
              className={`${card.bgColor} ${card.textColor} p-8 rounded-3xl card-hover relative overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl transform`}
            >
              {/* Animated background elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-4">
                  {card.stat.includes('Employees') || card.stat.includes('Ongoing') ? (
                    <div className="text-2xl font-bold mb-2">{card.stat}</div>
                  ) : (
                    card.stat
                  )}
                </div>
                <p className={`text-sm ${card.accentColor} mb-6 leading-relaxed`}>
                  {card.statDescription}
                </p>
                <h4 className="font-bold text-xl mb-3">{card.title}</h4>
                {card.description && (
                  <p className={`text-sm ${card.lightTextColor} leading-relaxed`}>
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    
    <main className='container mx-auto px-4 py-4 sm:px-6 lg:px-8'>
    {/* Featured Stories Carousel */}
    {!storiesLoading && stories?.length > 0 && (
          <section className="space-y-8 py-16 px-8 rounded-lg">
            {/* <motion.h2 
              className="text-3xl font-bold text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              Success Stories
            </motion.h2> */}
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Carousel
                opts={{ loop: true }}
                className="w-full"
              >
                <CarouselContent>
                  {stories.map((story: Story, index: number) => (
                    <CarouselItem key={story.id} className="md:basis-1/3">
                      <Card className="h-full bg-[#f7f6f4] border-[#f7f6f4]">
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={storyImages[index % storyImages.length]}
                            alt={story.title}
                            className="h-full w-full object-cover object-top transition-all hover:scale-105"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              console.error(`Failed to load image: ${target.src}`);
                              target.src = 'https://placehold.co/600x400?text=Story+Image';
                            }}
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                          <CardDescription>By {story.authorName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">
                            {expandedStories.has(story.id) ? story.content : story.excerpt}
                          </p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm text-primary mt-2"
                            onClick={() => toggleStoryExpansion(story.id)}
                          >
                            {expandedStories.has(story.id) ? 'Read Less' : 'Read More'}
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" /> */}
              </Carousel>
            </motion.div>
          </section>
    )}
    </main>
    
    {/* <section className="relative py-20 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700 text-white overflow-hidden w-full my-8"> */}
      {/* Background pattern */}
      {/* <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white rounded-full animate-pulse-slow"></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-white rounded-full animate-pulse-slow" 
          style={{ animationDelay: '1s' }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div> */}
      
      {/* <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-green-100 drop-shadow-lg">
          Better Tomorrows Begin with You
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
          Every TOMS purchase is more than just a choice of style—it's a decision to make a real difference in your community. Many thanks to your trust in TOMS, we've been able to support our Giving Partners in implementing life-changing initiatives that address some of the world's most pressing challenges.
        </p>
        
        <div className="mb-8">
          <p className="text-lg mb-6 text-white/80">
            Celebrate another impactful year with us by downloading our 2024 Impact Report.
          </p>
          <button className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl inline-flex items-center space-x-2 shadow-lg">
            <span>Read the 2024 Impact Report</span>
            <i className="fas fa-download"></i>
          </button>
        </div>
        
        <p className="text-sm text-white/70 mb-6">Take a peek into the past Impact Report archive</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="border-2 border-white/30 text-white px-6 py-3 rounded-full hover:bg-white hover:text-green-700 transition-all duration-300 font-medium backdrop-blur-sm hover:shadow-lg">
            2023 Impact Report
          </button>
          <button className="border-2 border-white/30 text-white px-6 py-3 rounded-full hover:bg-white hover:text-green-700 transition-all duration-300 font-medium backdrop-blur-sm hover:shadow-lg">
            2022 Impact Report
          </button>
        </div>
      </div> */}
    {/* </section> */}
    
    </Layout>
  );
};

export default WhyClaim;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gift, Award, BadgeCheck, TrendingUp, CircleDollarSign, Heart, Users, Leaf, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BenefitCard from './BenefitCard';
import {steps} from '@/data/steps';
import { partners } from '@/data/partners';

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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchStats, fetchSponsorStories } from '@/services/apiServices';
import { Story } from '@/models/Story';
import {impactBenefits, efficiencyBenefits, recognitionBenefits} from '@/data/benefits';
import { impactAreas } from '@/data/impactAreas';
// import { marketingMethods } from '@/data/marketingMethods';
import {marketingMethods} from "@/data/marketingMethods"; 
import { formatCurrency } from '@/utils/formatters';

// Sample data for the growth chart (fallback if API data is not available)
const fallbackGrowthData = [
  { month: 'Jan', sponsors: 10, impact: 100 },
  { month: 'Feb', sponsors: 15, impact: 200 },
  { month: 'Mar', sponsors: 25, impact: 320 },
  { month: 'Apr', sponsors: 30, impact: 450 },
  { month: 'May', sponsors: 37, impact: 650 },
  { month: 'Jun', sponsors: 45, impact: 840 },
];

const WhySponsor = () => {

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats
  });

  const { data: stories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ['sponsor-stories'],
    queryFn: fetchSponsorStories
  });

  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

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

  // Use real growth data from API or fallback to sample data
  const growthData = stats?.growthData || fallbackGrowthData;

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

  // Static images for Featured Stories Carousel
  const storyImages = [
    '/images/story1.png',
    '/images/story2.png',
    '/images/story3.png',
  ];



  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)' }}
        ></div> */}
        <img src="/images/why-sponsor.webp" alt="Why Sponsor" className="absolute inset-0 w-full h-full object-cover" />
        <div className="container relative z-20 text-center max-w-4xl mx-auto px-4 text-white">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Why Sponsor a Cause?
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Empower communities, gain brand recognition, and track real impact in real time.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button size="lg" asChild className="text-lg bg-green-600 hover:bg-green-700">
              <Link to="/causes">
                <Gift className="mr-2" /> Start Sponsoring
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto py-16 px-4 space-y-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
            Our Impact in Motion
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover how every TOMS purchase creates ripples of positive change across the globe.
          </p>
        </div>
        {/* Stats Cards Section */}
        <section className="space-y-6">
          <motion.h2
            className="text-3xl font-bold text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            {/* Impact in Numbers */}
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {statsLoading ? (
              <div className="flex justify-center items-center col-span-3 min-h-[200px]">
                <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
              </div>
            ) : (
              <>
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
                      Total Sponsors
                    </h3>
                    <div className="flex flex-col items-center justify-between">
                      <span className="text-7xl font-bold">{stats?.totalSponsors || 0}</span>
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
                      Active Campaigns
                    </h3>
                    <div className="flex flex-col items-center justify-between">
                      <span className="text-7xl font-bold">{stats?.activeCampaigns || 0}</span>
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
                      Bags Sponsored
                    </h3>
                    <div className="flex flex-col items-center justify-between">
                      <span className="text-7xl font-bold">{stats?.totalBagsSponsored || 0}</span>
                      <p className="text-emerald-100 mb-6 mt-3 leading-relaxed">
                        Eco-friendly totes with purpose
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </section>

        {/* Aims & Objectives Section */}
        {/* <section className="space-y-8">
          <motion.h2 
            className="text-3xl font-bold text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Our Aims & Objectives
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Award className="h-8 w-8 text-primary-500 mb-2" />
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Empower brands to drive real change through branded tote‐bag sponsorships.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary-500 mb-2" />
                  <CardTitle>Growth Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Increase active sponsors by 20% each quarter and reach 10,000 claimed bags in the first year.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <BadgeCheck className="h-8 w-8 text-primary-500 mb-2" />
                  <CardTitle>Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Ensure 95%+ of claims are fulfilled within 14 days with full tracking.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CircleDollarSign className="h-8 w-8 text-primary-500 mb-2" />
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Deliver clear, real-time impact analytics and digital badges for all sponsors.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section> */}

         {/* Partners Section */}
     <section className="bg-gradient-to-br from-gray-50 via-white to-green-50/30 py-24 relative overflow-hidden">
       <div className="relative z-10 container mx-auto px-4">
         <div className="text-center mb-20">
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
        
        {/* Benefits Showcase - Simplified */}
        <section className="relative space-y-8 bg-gradient-to-br from-gray-50 to-green-50 py-10 px-8 rounded-2xl overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <motion.div 
        className="relative text-center space-y-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Why 
          <span className='text-green-600 px-2'>Sponsor</span> 
          with Us?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Get maximum impact with minimal effort - from real community change to lasting brand recognition
        </p>
      </motion.div>
      
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="relative"
      >
        <Tabs defaultValue="impact" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12 h-14 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
            <TabsTrigger 
              value="impact" 
              className="text-sm font-semibold data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <Award className="w-4 h-4 mr-2" />
              Impact & ROI
            </TabsTrigger>
            <TabsTrigger 
              value="efficiency" 
              className="text-sm font-semibold data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Efficiency & Cost
            </TabsTrigger>
            <TabsTrigger 
              value="recognition" 
              className="text-sm font-semibold data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <BadgeCheck className="w-4 h-4 mr-2" />
              Brand Recognition
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="impact" className="space-y-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {impactBenefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  mainMetric={benefit.mainMetric}
                  metrics={benefit.metrics}
                  variants={fadeIn}
                />
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="efficiency" className="space-y-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {efficiencyBenefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  mainMetric={benefit.mainMetric}
                  metrics={benefit.metrics}
                  variants={fadeIn}
                />
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="recognition" className="space-y-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {recognitionBenefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  mainMetric={benefit.mainMetric}
                  metrics={benefit.metrics}
                  variants={fadeIn}
                />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
        </section>

        {/* Impact Gallery */}
        <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Impact <span className="text-[#008037]">Gallery</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Witness the transformative power of corporate partnerships in action
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {impactAreas.map((area, index) => (
            <div key={index} className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-[4/5]">
                <img 
                  src={area.image}
                  alt={area.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <h3 className="text-2xl font-bold mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {area.title}
                  </h3>
                  <p className="text-white mb-4 opacity-90 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {area.description}
                  </p>
                  <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                    {area.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="text-sm font-semibold text-green-600">
                        • {stat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
       </section>
        
        {/* Growth Chart */}
        {/* <section className="space-y-8">
          <motion.h2 
            className="text-3xl font-bold text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Sponsor Growth & Impact
          </motion.h2>
          
          <motion.div
            className="h-80 w-full"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ChartContainer
              className="h-full"
              config={{
                sponsors: {
                  label: "Sponsors",
                  theme: {
                    light: "#4CAF50",
                    dark: "#81C784",
                  },
                },
                impact: {
                  label: "Impact (bags)",
                  theme: {
                    light: "#FF5722",
                    dark: "#FF8A65",
                  },
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSponsors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5722" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="sponsors"
                    stroke="#4CAF50"
                    fillOpacity={1}
                    fill="url(#colorSponsors)"
                  />
                  <Area
                    type="monotone"
                    dataKey="impact"
                    stroke="#FF5722"
                    fillOpacity={1}
                    fill="url(#colorImpact)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </motion.div>
          <p className="text-center text-muted-foreground">
            Monthly growth of sponsors and total bags in circulation
          </p>
        </ Mareketing Section> */}
        <section className="py-10 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-10 animate-fade-in">
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
                  } ${index === marketingMethods.length-1 ? 'bg-green-50 text-white': ''} transition-all duration-300`}
                >
                  <td className="px-6 py-4 border-r border-black-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className='font-medium text-green-800'>
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

         {/* How it works */}
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It <span className="text-[#008037]">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A simple, transparent process to launch your brand’s next visibility campaign.
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

        {/* Featured Stories Carousel */}
        {!storiesLoading && stories?.length > 0 && (
          <section className="space-y-8 bg-[#f7f6f4] py-16 px-8 rounded-lg">
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
        
        {/* CTA Section */}
        <section className="py-16">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Make a Difference?</h2>
            <p className="text-lg text-muted-foreground">
              Join our community of sponsors and start making a measurable impact today. 
              Your brand can be part of positive change.
            </p>
            <Button size="lg" className="text-lg" asChild>
              <Link to="/causes">
                <Gift className="mr-2" /> Start Sponsoring Now
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
    </Layout>
  );
};

export default WhySponsor;

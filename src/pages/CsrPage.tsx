import React from 'react'
import Layout from '../components/Layout'
import {Button} from '../components/ui/button'
import heroImage from "/images/hero-community-impact.jpg";
import {Card} from '../components/ui/card'
import grassrootsImage from "/images/grassroots-scene.jpg";
import dashboardImage from "/images/csr-dashboard.jpg";
import { Link } from 'react-router-dom';
import { Users, Heart, Building2, Globe, Search, BarChart, Target, Handshake, TrendingUp, Share2, Quote, Star } from "lucide-react";
import {steps} from '../data/steps'
import { stats } from '../data/stats';
import { partners } from '../data/partners';

export const CsrPage = () => {

     const services = [
     {
       img: "/images/Frame-16.png",
       title: "Extended CSR Team"
     },
     {
       img: "/images/Frame-17.png",
       title: "Partner Identification & Due Diligence"
     },
     {
       img: "/images/Frame-18.png",
       title: "Monitoring & Evaluation"
     },
     {
       img: "/images/Frame-19.png",
       title: "Impact Assessment"
     }
   ];

   const impactAreas = [
    {
      title: "Environmental Conservation",
      description: "Protecting ecosystems and wildlife through sustainable practices",
      image: "https://images.unsplash.com/photo-1518877593221-1f28583780b4",
      stats: ["50K+ plastic bags replaced", "25K+ trees planted"]
    },
    {
      title: "Community Development", 
      description: "Supporting rural communities and sustainable livelihoods",
      image: "https://media.istockphoto.com/id/1395727601/photo/group-of-teenager-village-school-kids-planting-tree-while-looking-at-camera-concept-of.jpg?s=612x612&w=0&k=20&c=0WRQSt7PMNeypnshUB-M0bLjSbzZut2TygfqfWwRrVI=",
      stats: ["500+ communities reached", "15M+ lives impacted"]
    },
    {
      title: "Biodiversity Protection",
      description: "Preserving pollinator species and ecosystem health",
      image: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937", 
      stats: ["3K+ NGOs supported", "300+ corporate partners"]
    }
  ];

  const statistics = [
    {
      icon: <Handshake className="w-8 h-8 text-white mb-4" />,
      number: "300+",
      text: "brands partnered for CSR impact"
    },
    {
      icon: <Users className="w-8 h-8 text-white mb-4" />,
      number: "15M+",
      text: "lives touched across campaigns"
    },
    {
      icon: '/images/india.png',
      number: "India's first",
      text: "A CSR tech & product platform"
    }
  ];

  const testimonials = [
    {
      quote: "ChangeBag helped us achieve our CSR goals while creating genuine community impact. The transparency and reporting quality exceeded our expectations.",
      author: "Priya Sharma",
      position: "CSR Director",
      company: "Tech Solutions Ltd",
      rating: 5
    },
    {
      quote: "From ₹10 per bag, we've supported education initiatives and tracked every rupee spent. The MCA-compliant reporting made our audit seamless.",
      author: "Rajesh Kumar",
      position: "Sustainability Manager", 
      company: "Green Industries",
      rating: 5
    },
    {
      quote: "The custom dashboards give us real-time visibility into our CSR impact. Our stakeholders love the transparency and measurable outcomes.",
      author: "Anita Gupta",
      position: "Brand Manager",
      company: "Future Corp",
      rating: 5
    }
  ];

  return (
    <Layout>
        {/* Hero Section */}
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroImage}
          alt="Community impact through eco-friendly initiatives"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        // style={{
        //   background: 'var(--hero-gradient)'
        // }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-8 text-white max-w-2xl">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Empowering Brands to Drive{" "}
              <span className="text-green-500">Real Change</span>
            </h1>
            
            <p className="text-xl lg:text-2xl leading-relaxed opacity-95 max-w-xl">
              We help brands turn eco-friendly promotional products into measurable CSR impact — from trees planted to communities supported.
            </p>
            
            <div className="pt-4">
            <Link to='/why-sponsor'>
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-brand-green/90 text-white font-semibold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Become a Sponsor
              </Button>
            </Link>
            </div>
          </div>
          
          {/* Right side - Image area is handled by background */}
          <div className="hidden lg:block" />
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent" />
    </section>

    {/* Impact Statistics */}
    <section className="py-16 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            India's most trusted online{" "}
            <span className="text-[#008037]">CSR platform</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join hundreds of brands creating measurable social and environmental impact
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 text-[#008037] rounded-2xl group-hover:bg-[#008037] group-hover:text-white transition-colors duration-300">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-[#008037] mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CSRServicesSection */}
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image with Overlay */}
          <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
            <img
              src={grassrootsImage}
              alt="Grassroots community impact"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-8">
              <div className="text-center text-white">
                <h2 className="text-5xl md:text-6xl leading-tight">
                  We design your CSR programs{" "}
                  <span className="text-green-700">effectively</span>
                </h2>
              </div>
            </div>
          </div>

                     {/* Right Side - Services Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {services.map((service, index) => (
               <Card
                 key={index}
                 className="p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100"
               >
                 <div className="flex justify-center mb-4">
                   <img 
                     src={service.img} 
                     alt={service.title}
                     className="w-32 h-32 object-contain"
                   />
                 </div>
               </Card>
             ))}
           </div>
        </div>
      </div>
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
     
     {/* Partners Section */}
     <section className="bg-gradient-to-br from-gray-50 via-white to-green-50/30 py-24 relative overflow-hidden">
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
     
     {/* Platform Section */}
     <section className="py-20 bg-gradient-to-br from-brand-mint/20 to-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              We offer a single platform for your{" "}
              <span className="text-green-600">360° CSR journey</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              From tracking deliverables to collecting data, you can manage your CSR programmes all in one place.
            </p>
          </div>

          {/* Right Side - Dashboard Image */}
          <div className="relative">
            {/* <div className="bg-white rounded-xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 w-full h-full overflow-hidden"> */}
              <img
                src={dashboardImage}
                alt="CSR Analytics Dashboard"
                className="w-136 h-106 object-cover transform rotate-2 hover:rotate-0 transition-transform duration-300"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-brand-green/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-mint/20 rounded-full blur-xl"></div>
          {/* </div> */}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It <span className="text-[#008037]">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, transparent process from cause selection to impact measurement
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

    {/* CSR Section */}
    <section className="py-20 bg-gradient-to-br from-green-500 to-green-700">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Main Content */}
        <div className="text-center text-white mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            The ChangeBag CSR Way
          </h2>
          
          <div className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
            <p className="mb-4">
              CSR is not just a policy—it's a platform for purpose. At ChangeBag.org, we believe impactful CSR blends sustainability, community support, and brand integrity.
            </p>
          </div>
          
          <div className="text-lg md:text-xl leading-relaxed mb-8 opacity-90">
            <p className="mb-6 text-white">
              Whether you're a growing brand or an established enterprise, your CSR journey is unique. Our platform allows you to tie every branded tote to a real-world cause—measurable, transparent, and people-first.
            </p>
            {/* <p className="mb-6">
              From plastic reduction to afforestation and cause partnerships, we help you convert budgets into tangible change.
            </p> */}
          </div>
          
          {/* <p className="text-xl font-semibold">
            With our cause-backed model and real-time analytics, we help you deliver CSR that's both responsible and rewarding.
          </p> */}
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {statistics.map((statistic, index) => (
            <div key={index} className={`text-center text-white ${index!==stats.length-1 && 'border-r border-white'}`}>
              {/* <div className="flex justify-center mb-4">
                {statistic.icon}
              </div> */}
              {index!==statistics.length-1 ? (
              <div className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                {statistic.number}
              </div>
            ):(
            <div className="flex justify-center items-center mb-2 w-full">
              <img
                src={statistic.icon as string}
                alt={statistic.text}
                className="w-16 h-16 object-contain"
              />
            </div>
              )}
              <div className="text-lg opacity-90 leading-tight">
                {statistic.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Success <span className="text-[#008037]">Stories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from brands creating meaningful impact through ChangeBag partnerships
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <Quote className="h-8 w-8 text-[#008037] opacity-50" />
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              
              <div className="border-t pt-6">
                <div className="font-semibold text-gray-900 mb-1">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {testimonial.position}
                </div>
                <div className="text-sm text-[#008037] font-medium">
                  {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

     </Layout>
   )
 }

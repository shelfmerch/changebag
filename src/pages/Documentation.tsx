import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ArrowRight, 
  Users, 
  Settings, 
  Heart, 
  Package, 
  CreditCard,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const Documentation = () => {
  const documentationSections = [
    {
      title: "Getting Started",
      description: "New to CauseConnect? Start here to learn the basics",
      icon: <BookOpen className="h-6 w-6" />,
      articles: [
        { title: "What is Changebag?", time: "5 min read", popular: true },
        { title: "How to Create Your First Cause", time: "8 min read", popular: true },
        { title: "Setting Up Your Profile", time: "3 min read" },
        { title: "Understanding Tote Bag Campaigns", time: "6 min read" }
      ]
    },
    {
      title: "For Cause Claimers",
      description: "Learn how to claim and manage causes effectively",
      icon: <Heart className="h-6 w-6" />,
      articles: [
        { title: "How to Claim a Cause", time: "7 min read", popular: true },
        { title: "Managing Your Claimed Causes", time: "10 min read" },
        { title: "Tracking Impact and Analytics", time: "5 min read" },
        { title: "Working with Sponsors", time: "8 min read" }
      ]
    },
    {
      title: "For Sponsors",
      description: "Everything sponsors need to know about partnerships",
      icon: <Users className="h-6 w-6" />,
      articles: [
        { title: "How to Sponsor a Cause", time: "6 min read", popular: true },
        { title: "Sponsorship Benefits & ROI", time: "12 min read" },
        { title: "Brand Guidelines for Tote Bags", time: "4 min read" },
        { title: "Campaign Performance Metrics", time: "9 min read" }
      ]
    },
    {
      title: "Distribution & Shipping",
      description: "Learn about our distribution system and shipping process",
      icon: <Package className="h-6 w-6" />,
      articles: [
        { title: "How Distribution Works", time: "8 min read" },
        { title: "Shipping Policies & Timelines", time: "5 min read" },
        { title: "International Shipping", time: "6 min read" },
        { title: "Tracking Your Shipment", time: "3 min read" }
      ]
    },
    {
      title: "Payments & Billing",
      description: "Understanding payments, invoicing, and financial processes",
      icon: <CreditCard className="h-6 w-6" />,
      articles: [
        { title: "Payment Methods Accepted", time: "4 min read" },
        { title: "Understanding Invoices", time: "6 min read" },
        { title: "Refund Policy", time: "5 min read" },
        { title: "Tax Information", time: "7 min read" }
      ]
    },
    {
      title: "Account & Settings",
      description: "Manage your account, privacy, and platform settings",
      icon: <Settings className="h-6 w-6" />,
      articles: [
        { title: "Account Settings", time: "4 min read" },
        { title: "Privacy & Security", time: "8 min read" },
        { title: "Notification Preferences", time: "3 min read" },
        { title: "Deleting Your Account", time: "5 min read" }
      ]
    }
  ];

  const quickLinks = [
    { title: "API Documentation", icon: <FileText className="h-4 w-4" />, link: "#" },
    { title: "Contact Support", icon: <HelpCircle className="h-4 w-4" />, link: "mailto:support@shelfmerch.com" },
    { title: "Feature Requests", icon: <ExternalLink className="h-4 w-4" />, link: "#" },
    { title: "Community Forum", icon: <Users className="h-4 w-4" />, link: "#" }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
              <BookOpen className="h-4 w-4" />
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Learn how to use <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Changebag</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive guides, tutorials, and resources to help you make the most of our platform
            </p>
          </div>

          {/* Quick Links */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-200"
                onClick={() => {
                  if (link.link.startsWith('mailto:')) {
                    window.location.href = link.link;
                  } else {
                    window.open(link.link, '_blank');
                  }
                }}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.title}</span>
              </Button>
            ))}
          </div> */}

          {/* Documentation Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documentationSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      {section.icon}
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 text-sm">{section.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {section.articles.map((article, articleIndex) => (
                      <div 
                        key={articleIndex}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                              {article.title}
                            </h4>
                            {article.popular && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{article.time}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-green-600 to-green-500 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you every step of the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary"
                    onClick={() => window.location.href = 'mailto:support@shelfmerch.com'}
                    className="bg-white text-green-600 hover:bg-gray-100"
                  >
                    Contact Support
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-green-600"
                    onClick={() => window.open('#', '_blank')}
                  >
                    Join Community Forum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Documentation;
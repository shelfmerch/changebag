import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Mail, BookOpen, Users, Shield, Zap } from 'lucide-react';

const HelpCenter = () => {
  const navigate = useNavigate();
  const faqData = [
    {
      category: "Getting Started",
      icon: <Zap className="h-5 w-5" />,
      items: [
        {
          question: "How do I create a cause?",
          answer: "To create a cause, click on 'Create a Cause' in the navigation menu. You'll need to provide details about your cause, including title, description, target amount, and category. Make sure to upload an image that represents your cause effectively."
        },
        {
          question: "How do I sponsor a cause?",
          answer: "Browse through available causes and click 'Sponsor This Cause' on any cause you'd like to support. You'll be guided through the sponsorship process where you can set your budget and choose distribution channels."
        },
        {
          question: "How do I claim a tote?",
          answer: "Once a cause has an approved sponsorship, you can click 'Claim a Tote' to request your sustainable bag. You'll need to provide your shipping information and confirm your request."
        }
      ]
    },
    {
      category: "Account & Profile",
      icon: <Users className="h-5 w-5" />,
      items: [
        {
          question: "How do I update my profile?",
          answer: "You can update your profile information through your dashboard. Click on your avatar in the top right corner and select 'Profile' to make changes to your personal information."
        },
        {
          question: "How do I change my password?",
          answer: "To change your password, go to your profile settings and look for the 'Change Password' option. You'll need to enter your current password and then your new password twice for confirmation."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account through your profile settings. Please note that this action is irreversible and will remove all your data from our platform."
        }
      ]
    },
    {
      category: "Privacy & Security",
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          question: "How do you protect my data?",
          answer: "We use industry-standard encryption and security measures to protect your personal information. All data is stored securely and we never share your information with third parties without your explicit consent."
        },
        {
          question: "What information do you collect?",
          answer: "We collect only the information necessary to provide our services, including your name, email address, and any information you provide about your causes or sponsorships. You can review our Privacy Policy for complete details."
        },
        {
          question: "How can I report a security issue?",
          answer: "If you notice any security concerns, please contact us immediately at security@changebag.org. We take all security reports seriously and will investigate promptly."
        }
      ]
    },
    {
      category: "Technical Support",
      icon: <Zap className="h-5 w-5" />,
      items: [
        {
          question: "The website isn't loading properly",
          answer: "Try refreshing your browser or clearing your cache. If the issue persists, check your internet connection or try accessing the site from a different browser. Contact support if problems continue."
        },
        {
          question: "I can't upload images",
          answer: "Make sure your image file is in JPG, PNG, or GIF format and under 5MB. If you're still having issues, try using a different browser or check your internet connection."
        },
        {
          question: "My payment didn't go through",
          answer: "Check that your payment information is correct and that you have sufficient funds. If the issue persists, contact your bank to ensure there are no restrictions on the transaction."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      icon: <Mail className="h-6 w-6" />,
      action: "Contact Support",
      link: "mailto:support@shelfmerch.com",
      mailto: "support@shelfmerch.com",
      type: "email"
    },
    {
      title: "Terms of Service",
      description: "View our Terms of Service",
      icon: <Shield className="h-6 w-6" />,
      action: "View Terms",
      link: "/terms-of-service"
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive guides",
      icon: <BookOpen className="h-6 w-6" />,
      action: "View Docs",
      link: "/documentation",
      type: "navigate"
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
              <Search className="h-4 w-4" />
              Help & Support
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              How can we <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">help you?</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions, get support, and learn how to make the most of Changebag.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, guides, and FAQs..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {supportOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      if (option.type === "email") {
                        // Try multiple methods to open email client
                        const emailAddress = 'support@shelfmerch.com';
                        const mailtoLink = `mailto:${emailAddress}`;
                        
                        // Method 1: Create and click a temporary link
                        const tempLink = document.createElement('a');
                        tempLink.href = mailtoLink;
                        tempLink.style.display = 'none';
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);
                        
                        // Method 2: Fallback to window.location.href
                        setTimeout(() => {
                          try {
                            window.location.href = mailtoLink;
                          } catch (error) {
                            console.error('Failed to open email client:', error);
                            // Method 3: Copy to clipboard as final fallback
                            navigator.clipboard.writeText(emailAddress);
                            alert(`Email copied to clipboard: ${emailAddress}`);
                          }
                        }, 100);
                      } else if (option.type === "navigate") {
                        navigate(option.link);
                      } else {
                        window.open(option.link, '_blank');
                      }
                    }}
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-black">{category.category}</h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={itemIndex} 
                      value={`item-${categoryIndex}-${itemIndex}`}
                      className="bg-white rounded-lg border border-gray-200"
                    >
                      <AccordionTrigger className="px-6 py-4 text-left hover:bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black mb-4">Still need help?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  onClick={(e) => {
                    e.preventDefault();
                    // Try multiple methods to open email client
                    const emailAddress = 'support@shelfmerch.com';
                    const mailtoLink = `mailto:${emailAddress}`;
                    
                    // Method 1: Create and click a temporary link
                    const tempLink = document.createElement('a');
                    tempLink.href = mailtoLink;
                    tempLink.style.display = 'none';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                    
                    // Method 2: Fallback to window.location.href
                    setTimeout(() => {
                      try {
                        window.location.href = mailtoLink;
                      } catch (error) {
                        console.error('Failed to open email client:', error);
                        // Method 3: Copy to clipboard as final fallback
                        navigator.clipboard.writeText(emailAddress);
                        alert(`Email copied to clipboard: ${emailAddress}`);
                      }
                    }, 100);
                  }}
                >
                  Contact Support
                </Button>
                {/* <Button variant="outline" className="px-8 py-3">
                  Schedule a Call
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter; 
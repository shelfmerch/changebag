import React from 'react';
import Layout from '@/components/Layout';
import { Cookie, Shield, Settings, Eye, Database } from 'lucide-react';

const CookiePolicy = () => {
  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: <Shield className="h-6 w-6" />,
      description: "These cookies are necessary for the website to function properly and cannot be disabled.",
      examples: [
        "Authentication cookies to keep you logged in",
        "Security cookies to protect against fraud",
        "Session cookies to maintain your preferences"
      ]
    },
    {
      title: "Analytics Cookies",
      icon: <Database className="h-6 w-6" />,
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: [
        "Google Analytics to track page views",
        "Performance monitoring cookies",
        "User behavior analysis cookies"
      ]
    },
    {
      title: "Functional Cookies",
      icon: <Settings className="h-6 w-6" />,
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences.",
      examples: [
        "Language preference cookies",
        "Theme and display preferences",
        "Form auto-fill cookies"
      ]
    },
    {
      title: "Marketing Cookies",
      icon: <Eye className="h-6 w-6" />,
      description: "These cookies are used to track visitors across websites to display relevant advertisements.",
      examples: [
        "Social media tracking cookies",
        "Advertising network cookies",
        "Retargeting cookies"
      ]
    }
  ];

  const cookieDetails = [
    {
      title: "What Are Cookies?",
      content: "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our site, and personalizing content."
    },
    {
      title: "How We Use Cookies",
      content: "We use cookies to: improve website functionality, analyze site usage, personalize your experience, provide security features, and deliver relevant content. Some cookies are essential for the site to work properly, while others help us enhance your experience."
    },
    {
      title: "Third-Party Cookies",
      content: "We may use third-party services that place cookies on your device. These services help us with analytics, advertising, and social media integration. Each third-party service has its own privacy policy governing how they use your data."
    },
    {
      title: "Managing Your Cookie Preferences",
      content: "You can control and manage cookies through your browser settings. Most browsers allow you to block cookies, delete existing cookies, or be notified when cookies are being set. However, disabling certain cookies may affect website functionality."
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
              <Cookie className="h-4 w-4" />
              Cookie & Tracking Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Cookie <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We use cookies and similar technologies to enhance your experience on Changebag. 
              This policy explains how we use these technologies and your options for managing them.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Cookie Types */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Types of Cookies We Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      {type.icon}
                    </div>
                    <h3 className="text-xl font-bold text-black">{type.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{type.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Examples:</h4>
                    <ul className="space-y-1">
                      {type.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Information */}
          <div className="max-w-4xl mx-auto space-y-8">
            {cookieDetails.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-black mb-4">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}

            {/* Cookie Management */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Managing Your Cookie Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Chrome: Settings → Privacy and security → Cookies</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Firefox: Options → Privacy & Security → Cookies</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Safari: Preferences → Privacy → Manage Website Data</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Edge: Settings → Cookies and site permissions</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Consent</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    When you first visit our website, you'll see a cookie consent banner. You can:
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Accept all cookies for full functionality</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Customize your preferences</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Reject non-essential cookies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Third-Party Services */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Third-Party Services</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics Services</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We use Google Analytics to understand how visitors use our website. Google Analytics uses cookies to collect information about your use of our site, including your IP address. This information is transmitted to and stored by Google.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Processors</h3>
                  <p className="text-gray-600 leading-relaxed">
                    When you make a payment, our payment processors may use cookies to ensure secure transactions and prevent fraud. These cookies are essential for payment processing and cannot be disabled.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our website may include social media features that use cookies to track your activity. These features are provided by third-party social media platforms and are subject to their respective privacy policies.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates and Contact */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-black mb-4">Updates to This Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. 
                We will notify you of any material changes by posting the updated policy on this page.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions About Cookies?</h3>
                  <p className="text-gray-600 text-sm">
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Email:</strong> privacy@changebag.org
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Preferences</h3>
                  <p className="text-gray-600 text-sm">
                    You can update your cookie preferences at any time through your browser settings or by contacting us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CookiePolicy; 
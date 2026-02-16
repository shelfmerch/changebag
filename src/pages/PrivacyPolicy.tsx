import React from 'react';
import Layout from '@/components/Layout';
import { Shield, Eye, Lock, Users, Database, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: <Database className="h-6 w-6" />,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, create a cause, sponsor a cause, or contact us for support. This may include your name, email address, phone number, and any other information you choose to provide."
        },
        {
          subtitle: "Cause Information",
          text: "When you create a cause, we collect information about the cause including title, description, target amount, category, and any images you upload. This information is used to display your cause on our platform and facilitate sponsorships."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information about your use of our services, including your IP address, browser type, operating system, pages visited, and time spent on those pages. This helps us improve our services and provide better user experience."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <Eye className="h-6 w-6" />,
      content: [
        {
          subtitle: "Providing Our Services",
          text: "We use your information to provide, maintain, and improve our services, including processing sponsorships, facilitating communication between users, and managing your account."
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you important updates about our services, respond to your inquiries, and provide customer support."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to understand how our services are used and to improve the user experience. This helps us develop new features and optimize existing ones."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: <Users className="h-6 w-6" />,
      content: [
        {
          subtitle: "With Your Consent",
          text: "We may share your information with third parties when you give us explicit consent to do so. For example, when you choose to sponsor a cause, we may share relevant information with the cause creator."
        },
        {
          subtitle: "Service Providers",
          text: "We work with trusted third-party service providers who help us operate our platform, such as payment processors, hosting providers, and analytics services. These providers are bound by confidentiality obligations."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law or if we believe in good faith that such action is necessary to comply with legal processes, protect our rights, or ensure the safety of our users."
        }
      ]
    },
    {
      title: "Data Security",
      icon: <Lock className="h-6 w-6" />,
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments."
        },
        {
          subtitle: "Data Retention",
          text: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your data at any time, subject to certain legal obligations."
        },
        {
          subtitle: "Your Responsibility",
          text: "While we strive to protect your information, you are responsible for maintaining the security of your account credentials and for any activities that occur under your account."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: <Shield className="h-6 w-6" />,
      content: [
        {
          subtitle: "Access and Control",
          text: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of the data we hold about you."
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of certain communications, such as marketing emails, by following the unsubscribe instructions in those communications or by updating your preferences in your account settings."
        },
        {
          subtitle: "Data Portability",
          text: "You have the right to receive your personal information in a structured, commonly used format that you can transfer to another service provider."
        }
      ]
    },
    {
      title: "International Transfers",
      icon: <Globe className="h-6 w-6" />,
      content: [
        {
          subtitle: "Global Operations",
          text: "Our services are available globally, and your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws."
        },
        {
          subtitle: "Data Protection Standards",
          text: "Regardless of where your information is processed, we maintain the same level of protection as described in this policy and comply with applicable data protection regulations."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
              <Shield className="h-4 w-4" />
              Privacy & Data Protection
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Privacy <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are committed to protecting your privacy and ensuring the security of your personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Policy Sections */}
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-black">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.subtitle}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Questions</h3>
                  <p className="text-gray-600 mb-2">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <strong>Email:</strong> privacy@changebag.org
                    </p>
                    <p className="text-gray-600">
                      <strong>Address:</strong> 123 Cause Street, Impact City, IC 12345
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Protection Officer</h3>
                  <p className="text-gray-600 mb-2">
                    For specific data protection inquiries or to exercise your rights:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <strong>Email:</strong> dpo@changebag.org
                    </p>
                    <p className="text-gray-600">
                      <strong>Response Time:</strong> Within 30 days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates Section */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-black mb-4">Policy Updates</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. 
                We encourage you to review this policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy; 
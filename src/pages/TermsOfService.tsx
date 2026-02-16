import React from 'react';
import Layout from '@/components/Layout';
import { FileText, Shield, Users, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

const TermsOfService = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing or using Changebag, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the updated terms on this page. Your continued use of the platform after such modifications constitutes acceptance of the new terms."
        }
      ]
    },
    {
      title: "User Accounts and Registration",
      icon: <Users className="h-6 w-6" />,
      content: [
        {
          subtitle: "Account Creation",
          text: "To use certain features of our platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion. You may also terminate your account at any time through your account settings."
        }
      ]
    },
    {
      title: "Platform Usage",
      icon: <FileText className="h-6 w-6" />,
      content: [
        {
          subtitle: "Permitted Use",
          text: "You may use our platform to create causes, sponsor causes, claim totes, and interact with other users in accordance with these terms. All use must be for lawful purposes and in compliance with applicable laws and regulations."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You agree not to use the platform to: (a) violate any laws or regulations; (b) infringe on the rights of others; (c) upload malicious content or software; (d) attempt to gain unauthorized access to our systems; (e) interfere with the platform's operation; or (f) engage in any other harmful or inappropriate behavior."
        },
        {
          subtitle: "Content Guidelines",
          text: "All content you submit must be accurate, lawful, and appropriate. You retain ownership of your content but grant us a license to use it in connection with our services. We reserve the right to remove content that violates these guidelines."
        }
      ]
    },
    {
      title: "Causes and Sponsorships",
      icon: <Shield className="h-6 w-6" />,
      content: [
        {
          subtitle: "Creating Causes",
          text: "When creating a cause, you must provide accurate information and ensure the cause is legitimate and lawful. You are responsible for the accuracy of all information provided and for ensuring the cause complies with all applicable laws and regulations."
        },
        {
          subtitle: "Sponsorship Process",
          text: "Sponsorships are processed through our platform using secure payment methods. All transactions are subject to our payment terms and any applicable fees. We reserve the right to refuse or cancel any sponsorship at our discretion."
        },
        {
          subtitle: "Tote Claims",
          text: "Tote claims are subject to availability and verification. We will verify your eligibility before processing your claim. Shipping and delivery are subject to our shipping policies and any applicable terms."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: <Scale className="h-6 w-6" />,
      content: [
        {
          subtitle: "Platform Ownership",
          text: "Changebag and its content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission."
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of content you submit to our platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content in connection with our services."
        },
        {
          subtitle: "Trademarks",
          text: "All trademarks, service marks, and logos used on our platform are our property or the property of their respective owners. You may not use these marks without our written permission."
        }
      ]
    },
    {
      title: "Limitation of Liability",
      icon: <AlertTriangle className="h-6 w-6" />,
      content: [
        {
          subtitle: "Disclaimer of Warranties",
          text: "Our platform is provided 'as is' without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement."
        },
        {
          subtitle: "Limitation of Damages",
          text: "In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our platform."
        },
        {
          subtitle: "Maximum Liability",
          text: "Our total liability to you for any claims arising out of or relating to these terms or your use of our platform shall not exceed the amount you paid us in the twelve months preceding the claim."
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
              <FileText className="h-4 w-4" />
              Legal Terms & Conditions
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Terms of <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These terms govern your use of Changebag and outline the rights and responsibilities 
              of both users and our platform.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Terms Sections */}
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

            {/* Additional Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Additional Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h3>
                  <p className="text-gray-600 leading-relaxed">
                    These terms are governed by and construed in accordance with the laws of the jurisdiction 
                    where Changebag is incorporated, without regard to conflict of law principles.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Dispute Resolution</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Any disputes arising from these terms or your use of our platform will be resolved 
                    through binding arbitration in accordance with our dispute resolution procedures.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Severability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    If any provision of these terms is found to be unenforceable, the remaining provisions 
                    will continue in full force and effect.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Entire Agreement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    These terms constitute the entire agreement between you and Changebag regarding 
                    your use of our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-black mb-4">Questions About These Terms?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact our legal team:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600">
                    <strong>Email:</strong> legal@Changebag.org
                  </p>
                  <p className="text-gray-600">
                    <strong>Response Time:</strong> Within 5 business days
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Address:</strong> 123 Cause Street, Impact City, IC 12345
                  </p>
                  <p className="text-gray-600">
                    <strong>Hours:</strong> Mon-Fri 9AM-6PM EST
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

export default TermsOfService; 
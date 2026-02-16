import React from 'react';
import Layout from '@/components/Layout';
import { Accessibility, Eye, Volume2, MousePointer, Keyboard, Smartphone } from 'lucide-react';

const AccessibilityPage = () => {
  const accessibilityFeatures = [
    {
      title: "Keyboard Navigation",
      icon: <Keyboard className="h-6 w-6" />,
      description: "Navigate our platform using only your keyboard. All interactive elements are accessible via keyboard controls.",
      features: [
        "Tab navigation through all interactive elements",
        "Enter and Space keys for activation",
        "Arrow keys for dropdown menus and sliders",
        "Escape key to close modals and menus"
      ]
    },
    {
      title: "Screen Reader Support",
      icon: <Volume2 className="h-6 w-6" />,
      description: "Our platform is compatible with popular screen readers and assistive technologies.",
      features: [
        "Semantic HTML structure for proper navigation",
        "ARIA labels and descriptions for complex elements",
        "Alternative text for all images and icons",
        "Proper heading hierarchy for content structure"
      ]
    },
    {
      title: "Visual Accessibility",
      icon: <Eye className="h-6 w-6" />,
      description: "We maintain high contrast ratios and provide visual alternatives for better accessibility.",
      features: [
        "High contrast color schemes",
        "Resizable text without loss of functionality",
        "Clear focus indicators for keyboard navigation",
        "Consistent visual design patterns"
      ]
    },
    {
      title: "Mobile Accessibility",
      icon: <Smartphone className="h-6 w-6" />,
      description: "Our platform is fully accessible on mobile devices with touch and voice controls.",
      features: [
        "Touch-friendly button sizes and spacing",
        "Voice control compatibility",
        "Responsive design for all screen sizes",
        "Gesture alternatives for all interactions"
      ]
    }
  ];

  const complianceInfo = [
    {
      title: "WCAG 2.1 Compliance",
      content: "We strive to meet WCAG 2.1 AA standards, ensuring our platform is accessible to users with various disabilities. Our development process includes regular accessibility audits and testing with assistive technologies."
    },
    {
      title: "Ongoing Improvements",
      content: "We continuously work to improve accessibility by gathering feedback from users, conducting regular audits, and staying updated with accessibility best practices and guidelines."
    },
    {
      title: "Testing and Validation",
      content: "Our platform undergoes regular accessibility testing using automated tools, manual testing with assistive technologies, and feedback from users with disabilities."
    }
  ];

  const assistiveTechnologies = [
    {
      name: "Screen Readers",
      description: "Compatible with JAWS, NVDA, VoiceOver, and TalkBack",
      tips: "Use proper heading navigation and landmark regions"
    },
    {
      name: "Voice Control",
      description: "Works with Dragon NaturallySpeaking, Voice Control (iOS), and Voice Access (Android)",
      tips: "Use clear, descriptive commands for navigation"
    },
    {
      name: "Switch Control",
      description: "Supports switch navigation for users with motor impairments",
      tips: "Configure switch timing and scanning options"
    },
    {
      name: "Magnification",
      description: "Compatible with browser zoom and screen magnification software",
      tips: "Use browser zoom up to 200% without loss of functionality"
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
              <Accessibility className="h-4 w-4" />
              Digital Accessibility
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Accessibility <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Statement</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are committed to making Changebag accessible to everyone. 
              Our platform is designed to work for users of all abilities and assistive technologies.
            </p>
          </div>

          {/* Accessibility Features */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Accessibility Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accessibilityFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-black">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Key Features:</h4>
                    <ul className="space-y-1">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Information */}
          <div className="max-w-4xl mx-auto space-y-8 mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Compliance & Standards</h2>
            {complianceInfo.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-4">{section.title}</h3>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Assistive Technologies */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">Assistive Technology Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assistiveTechnologies.map((tech, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-black mb-2">{tech.name}</h3>
                  <p className="text-gray-600 mb-3">{tech.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Tip:</strong> {tech.tips}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Tools */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Accessibility Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Extensions</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Chrome: Accessibility Extensions</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Firefox: Accessibility Add-ons</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Safari: VoiceOver and Accessibility Features</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Built-in Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">High contrast mode support</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Font size adjustment</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">Focus indicators and navigation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback and Support */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-black mb-4">We Value Your Feedback</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We are committed to continuously improving accessibility. If you encounter any accessibility issues 
                or have suggestions for improvement, please let us know.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Issues</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    If you experience accessibility barriers, please contact us:
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Email:</strong> accessibility@changebag.org
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Response Time:</strong> Within 48 hours
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility Resources</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Learn more about digital accessibility:
                  </p>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">• WCAG Guidelines</p>
                    <p className="text-gray-600 text-sm">• Assistive Technology Guides</p>
                    <p className="text-gray-600 text-sm">• Accessibility Testing Tools</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Commitment Statement */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-4">Our Commitment</h2>
              <p className="text-gray-600 leading-relaxed">
                At Changebag, we believe that digital accessibility is a fundamental right, not a privilege. 
                We are committed to ensuring that our platform is accessible to users of all abilities, including 
                those using assistive technologies. Our accessibility efforts are ongoing, and we welcome feedback 
                from our community to help us improve.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilityPage; 
// /data/benefitsData.js

import { Award, TrendingUp, Gift, BadgeCheck, CircleDollarSign } from "lucide-react";

export const impactBenefits = [
  {
    icon: Award,
    title: "Real Change",
    description: "Support vetted causes with tangible outcomes you can track in real-time through our comprehensive dashboard.",
    mainMetric: "95%",
    metrics: [
      { label: "Cause Verification", value: "100%" },
      { label: "Impact Tracking", value: "Real-time" },
      { label: "Transparency", value: "Full" }
    ]
  },
  {
    icon: TrendingUp,
    title: "Measurable ROI",
    description: "See exactly how your sponsorship translates to bags claimed and community impact with detailed analytics.",
    mainMetric: "3.2x",
    metrics: [
      { label: "ROI vs Traditional Ads", value: "3.2x Higher" },
      { label: "Brand Exposure", value: "Years vs Days" },
      { label: "Cost per Impression", value: "₹8-₹15" }
    ]
  },
  {
    icon: Gift,
    title: "Sustainable Products",
    description: "Your brand on eco-friendly tote bags that reduce plastic waste while promoting your sustainability values.",
    mainMetric: "100%",
    metrics: [
      { label: "Eco-friendly Material", value: "100%" },
      { label: "Plastic Reduction", value: "500+ bags/year" },
      { label: "Lifespan", value: "3-5 years" }
    ]
  }
];

export const efficiencyBenefits = [
  {
    icon: BadgeCheck,
    title: "Simple Process",
    description: "Our streamlined sponsorship process takes just minutes, with full support and guidance at every step.",
    mainMetric: "5min",
    metrics: [
      { label: "Setup Time", value: "5 minutes" },
      { label: "Support Available", value: "24/7" },
      { label: "Documentation", value: "Auto-generated" }
    ]
  },
  {
    icon: TrendingUp,
    title: "Cost Effective",
    description: "Get more brand exposure per dollar compared to traditional advertising channels with long-term visibility.",
    mainMetric: "60%",
    metrics: [
      { label: "Cost Savings", value: "60% Less" },
      { label: "CPM Rate", value: "₹8-₹15" },
      { label: "Volume Discounts", value: "Up to 25%" }
    ]
  },
  {
    icon: CircleDollarSign,
    title: "Transparent Pricing",
    description: "Clear, upfront pricing with no hidden fees and flexible volume discounts for larger commitments.",
    mainMetric: "0%",
    metrics: [
      { label: "Hidden Fees", value: "0%" },
      { label: "Setup Costs", value: "Free" },
      { label: "Payment Terms", value: "Flexible" }
    ]
  }
];

export const recognitionBenefits = [
  {
    icon: Award,
    title: "Brand Visibility",
    description: "Your logo on quality tote bags that travel with users for years, creating ongoing organic exposure.",
    mainMetric: "1M+",
    metrics: [
      { label: "Daily Impressions", value: "1M+" },
      { label: "Brand Lifespan", value: "3-5 years" },
      { label: "Geographic Reach", value: "Pan-India" }
    ]
  },
  {
    icon: BadgeCheck,
    title: "Digital Badge",
    description: "Display your impact badge on your website and social media to showcase your social responsibility commitment.",
    mainMetric: "100%",
    metrics: [
      { label: "Badge Availability", value: "100%" },
      { label: "Social Sharing", value: "Auto-generated" },
      { label: "SEO Benefits", value: "Included" }
    ]
  },
  {
    icon: TrendingUp,
    title: "Social Proof",
    description: "Featured in our sponsors directory and PR materials with option for detailed case study highlights.",
    mainMetric: "500+",
    metrics: [
      { label: "Featured Sponsors", value: "500+" },
      { label: "PR Coverage", value: "Monthly" },
      { label: "Case Studies", value: "Available" }
    ]
  }
];

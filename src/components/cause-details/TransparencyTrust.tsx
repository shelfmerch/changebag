
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface TransparencyTrustProps {
  partnerLogos: string[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const TransparencyTrust = ({ partnerLogos }: TransparencyTrustProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Transparency & Trust
        </motion.h2>
        
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          {partnerLogos.map((logo, index) => (
            <img 
              key={index}
              src={logo} 
              alt="Partner logo" 
              className="h-12 object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </motion.div>
        
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { delay: 0.2, duration: 0.5 } 
            }
          }}
        >
          <div className="flex items-center border rounded-full px-4 py-2 bg-green-50 text-green-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium">100% Utilization</span>
          </div>
          <div className="flex items-center border rounded-full px-4 py-2 bg-blue-50 text-blue-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium">Tax Exempt</span>
          </div>
          <div className="flex items-center border rounded-full px-4 py-2 bg-yellow-50 text-yellow-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
        </motion.div>
        
        <div className="text-center">
          <Button variant="link" asChild>
            <a href="#">View Financial Reports</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TransparencyTrust;

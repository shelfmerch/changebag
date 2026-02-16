
import React from 'react';
import { motion } from 'framer-motion';

interface WhyItMattersProps {
  microStoryText: string;
  microStoryImageUrl: string;
}

const WhyItMatters = ({ microStoryText, microStoryImageUrl }: WhyItMattersProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          Why It Matters
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
            }}
          >
            <blockquote className="text-xl italic border-l-4 border-primary-600 pl-4">
              {microStoryText}
            </blockquote>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
            }}
          >
            <img 
              src={microStoryImageUrl} 
              alt="Impact story" 
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMatters;

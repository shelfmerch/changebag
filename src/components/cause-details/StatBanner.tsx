
import React from 'react';
import { motion } from 'framer-motion';
import { CountUp } from '@/components/cause-details/CountUp';

interface StatBannerProps {
  number: number;
  unit: string;
  description: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const StatBanner = ({ number, unit, description }: StatBannerProps) => {
  return (
    <section className="bg-primary-600 text-white py-10">
      <div className="container mx-auto px-4 text-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex flex-col items-center"
        >
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            <CountUp target={number} /> {unit}
          </p>
          <p className="text-xl max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default StatBanner;

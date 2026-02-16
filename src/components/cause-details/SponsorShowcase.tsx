
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sponsor } from '@/types';

interface SponsorShowcaseProps {
  sponsors: Sponsor[];
}

const SponsorShowcase = ({ sponsors }: SponsorShowcaseProps) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Our Amazing Sponsors
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {sponsors && sponsors.length > 0 ? sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor._id}
              className="flex flex-col items-center group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Avatar className="w-16 h-16 mb-3 border-2 border-primary-200 group-hover:border-primary-400 transition-colors">
                <AvatarFallback className="text-lg font-semibold bg-primary-100 text-primary-800">
                  {sponsor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-center text-gray-700 group-hover:text-primary-600 transition-colors">
                {sponsor.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${sponsor.amount.toLocaleString()}
              </p>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No sponsors yet. Be the first to support this cause!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SponsorShowcase;

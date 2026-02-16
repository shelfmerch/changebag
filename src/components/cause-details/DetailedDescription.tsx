
import React from 'react';
import { motion } from 'framer-motion';

interface DetailedDescriptionProps {
  content: string;
}

const DetailedDescription = ({ content }: DetailedDescriptionProps) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">About This Cause</h2>
          <div className="prose prose-lg mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-xl font-semibold mb-4">The Challenge</h3>
                <p className="text-gray-700 mb-6">
                  {content}
                </p>
                <h3 className="text-xl font-semibold mb-4">Our Approach</h3>
                <p className="text-gray-700">
                  We work directly with local communities to distribute high-quality, 
                  reusable tote bags that replace hundreds of single-use plastic bags. 
                  Each distribution event includes education about environmental impact 
                  and sustainable living practices.
                </p>
              </div>
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Environmental impact"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Community distribution"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DetailedDescription;

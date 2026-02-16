
import React from 'react';
import { motion } from 'framer-motion';

interface BriefStoryProps {
  story: {
    text: string;
    authorName: string;
    authorImage: string;
  };
}

const BriefStory = ({ story }: BriefStoryProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-primary-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <blockquote className="text-xl md:text-2xl italic text-gray-700 leading-relaxed">
                  "{story.text}"
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <img
                    src={story.authorImage}
                    alt={story.authorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{story.authorName}</p>
                    <p className="text-sm text-gray-600">Community Member</p>
                  </div>
                </div>
              </div>
              <motion.div
                className="w-full md:w-64 h-48 md:h-64 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                  alt="Community impact"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BriefStory;

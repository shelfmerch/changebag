
import React from 'react';
import { motion } from 'framer-motion';

interface ImpactItem {
  icon: string;
  caption: string;
}

interface ImpactGridProps {
  items: ImpactItem[];
  Icons: Record<string, () => JSX.Element>;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ImpactGrid = ({ items, Icons }: ImpactGridProps) => {
  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName];
    
    if (IconComponent) {
      return <IconComponent />;
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Our Impact Areas
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { 
                    delay: index * 0.2,
                    duration: 0.5
                  } 
                }
              }}
              whileHover={{ 
                scale: 1.05, 
                transition: { duration: 0.2 } 
              }}
            >
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                {renderIcon(item.icon)}
              </div>
              <p className="text-center font-medium">{item.caption}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactGrid;


import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SupportItem {
  amount: number;
  helps: string;
  progress: number;
}

interface ImpactBreakdownProps {
  items: SupportItem[];
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.6 } }
};

const ImpactBreakdown = ({ items }: ImpactBreakdownProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold text-center mb-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
          }}
        >
          How Your Monthly Support Helps
        </motion.h2>
        <motion.p 
          className="text-center text-gray-600 mb-10 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          See the tangible difference your contributions make
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { 
                    delay: index * 0.15,
                    duration: 0.5
                  } 
                }
              }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-primary-600">${item.amount}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{item.helps}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{item.progress}% funded</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactBreakdown;

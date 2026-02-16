
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FinalCtaProps {
  title: string;
  handleAction: () => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const FinalCta = ({ title, handleAction }: FinalCtaProps) => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-primary-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.h2 
          className="text-3xl font-bold mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Ready to Make a Difference?
        </motion.h2>
        <motion.p 
          className="text-xl max-w-2xl mx-auto mb-10"
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
          Your support can transform lives and communities through the {title}.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.4, duration: 0.6 } 
            }
          }}
        >
          <Button 
            size="lg" 
            onClick={handleAction}
            className="px-10 py-6 text-lg bg-white text-primary-600 hover:bg-gray-100"
          >
            Support {title}
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-6 text-lg border-white text-white hover:bg-white hover:text-primary-600"
            onClick={() => navigate('/causes')}
          >
            Explore Other Causes
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;

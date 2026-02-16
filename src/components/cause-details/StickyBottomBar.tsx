import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface StickyBottomBarProps {
  onAction: () => void;
  onSponsor: () => void;
  onLearnMore: () => void;
  status: string;
  targetAmount: number;
  currentAmount: number;
  hasSponsorship?: boolean;
}

const StickyBottomBar = ({ onAction, onSponsor, onLearnMore, status, targetAmount, currentAmount, hasSponsorship = false }: StickyBottomBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const promptText = 'Ready to make a difference?';

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const threshold = window.innerHeight * 0.5; // Show after scrolling 50% of viewport
      setIsVisible(scrolled > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-gray-900">{promptText}</p>
                <p className="text-sm text-gray-600">Join thousands of supporters today</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-end">







                {!hasSponsorship && (
                  <Button
                    variant="outline"
                    onClick={onLearnMore}
                    className="px-6"
                  >
                    Learn More
                  </Button>
                )}
                







                {/* Show Claim a Tote button only when sponsorship is approved */}
                {hasSponsorship && (
                  <Button
                    onClick={onAction}
                    className="px-8 bg-black text-white"
                  >
                    Claim a Tote
                  </Button>
                )}
                


                {/* Show Sponsor button only until funding goal is reached and when not sponsored */}
                {currentAmount < targetAmount && !hasSponsorship && (
                  <Button
                    onClick={onSponsor}
                    className="px-8 bg-black text-white"
                  >
                    Sponsor this Cause
                  </Button>
                )}
                
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

};
export default StickyBottomBar;

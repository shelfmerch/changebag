
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Cause } from '@/types';

interface OverviewCardsProps {
  cause: Cause;
}

const OverviewCards = ({ cause }: OverviewCardsProps) => {
  const cards = [
    {
      icon: Target,
      title: "Mission",
      content: "Reduce plastic waste through sustainable alternatives"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Global distribution network"
    },
    {
      icon: Calendar,
      title: "Duration",
      content: "Ongoing initiative since 2023"
    },
    {
      icon: TrendingUp,
      title: "Impact Goal",
      content: `${cause.targetAmount.toLocaleString()} bags distributed`
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <card.icon className="w-8 h-8 mx-auto mb-4 text-primary-600" />
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OverviewCards;

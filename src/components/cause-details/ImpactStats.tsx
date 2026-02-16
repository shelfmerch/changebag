
import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Leaf, Heart } from 'lucide-react';
import { CountUp } from '@/components/cause-details/CountUp';

interface Stat {
  label: string;
  value: number;
  icon: string;
}

interface ImpactStatsProps {
  stats: Stat[];
}

const iconMap = {
  users: Users,
  'shopping-bag': ShoppingBag,
  leaf: Leaf,
  heart: Heart,
};

const ImpactStats = ({ stats }: ImpactStatsProps) => {
  return (
    <section className="py-16 bg-primary-600 text-white">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Our Impact So Far
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon as keyof typeof iconMap] || Heart;
            return (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <IconComponent className="w-12 h-12 mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">
                  <CountUp target={stat.value} />
                </div>
                <p className="text-xl">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;

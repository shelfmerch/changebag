import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  mainMetric: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  variants: any;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon: Icon,
  title,
  description,
  mainMetric,
  metrics,
  variants
}) => {
  return (
    <motion.div variants={variants} className="h-full">
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-600 bg-white group hover:border-l-green-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <Icon className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
            </div>
            <div className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform">
              {mainMetric}
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {metrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">{metric.label}</span>
                <span className="text-sm font-semibold text-gray-800">{metric.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BenefitCard;

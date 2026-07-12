import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { EmptyState } from '../components/dashboard/EmptyState';
import { motion } from 'framer-motion';

const Analytics: React.FC = () => {
  return (
    <div className="pb-24">
      <PageHeader 
        title="Analytics" 
        description="Track your interview performance over time and identify areas where you can improve the most."
        icon={BarChart3}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <EmptyState 
          title="Not enough data"
          description="Complete at least one mock interview to unlock your performance analytics and charts."
          icon={TrendingUp}
          actionLabel="Generate Interview"
          actionTo="/generate"
        />
      </motion.div>
    </div>
  );
};

export default Analytics;

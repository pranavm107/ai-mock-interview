import React from 'react';
import { Trophy, Award } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { EmptyState } from '../components/dashboard/EmptyState';
import { motion } from 'framer-motion';

const Achievements: React.FC = () => {
  return (
    <div className="pb-24">
      <PageHeader 
        title="Achievements" 
        description="Celebrate your milestones, learning progress, and unlock new badges as you practice."
        icon={Trophy}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <EmptyState 
          title="No achievements yet"
          description="Start practicing to earn your first milestone badge. The more you interview, the more you unlock!"
          icon={Award}
          actionLabel="View Milestones"
          actionTo="/achievements"
        />
      </motion.div>
    </div>
  );
};

export default Achievements;

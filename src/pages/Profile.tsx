import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { User as UserIcon } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  return (
    <div className="pb-12 max-w-5xl mx-auto space-y-4 sm:space-y-5">
      <PageHeader 
        title="My Profile" 
        description="View and edit your personal information and authentication settings securely."
        icon={UserIcon}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white p-3 sm:p-5 rounded-xl shadow-xs border border-slate-200/90 flex justify-center"
      >
        <div className="w-full max-w-4xl flex justify-center">
          {/* Clerk UserProfile natively styles itself, but we constrain its container */}
          <UserProfile path="/profile" routing="path" appearance={{
            elements: {
              card: "shadow-none w-full",
              navbar: "border-r border-slate-200"
            }
          }} />
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

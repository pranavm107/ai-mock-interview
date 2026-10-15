import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  return (
    <div className="pb-12 max-w-4xl mx-auto space-y-4 sm:space-y-5">
      <PageHeader 
        title="Settings" 
        description="Manage your account preferences, notification settings, and billing information."
        icon={SettingsIcon}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/90"
      >
        <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
          Application settings will appear here. This space will include toggles for email notifications, privacy settings, and subscription management.
        </p>

        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg border border-slate-100 opacity-60 flex items-center px-4">
              <div className="w-36 h-3 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

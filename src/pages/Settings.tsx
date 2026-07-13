import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  return (
    <div className="pb-24">
      <PageHeader 
        title="Settings" 
        description="Manage your account preferences, notification settings, and billing information."
        icon={SettingsIcon}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-4xl bg-white p-8 rounded-[20px] shadow-sm border border-slate-200"
      >
        <p className="text-slate-600 mb-8 leading-relaxed">
          Application settings will appear here. This space will include toggles for email notifications, privacy settings, and subscription management.
        </p>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100 opacity-60 flex items-center px-6">
              <div className="w-48 h-4 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

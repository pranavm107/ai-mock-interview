import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';

const Generate: React.FC = () => {
  return (
    <div className="pb-24">
      <PageHeader 
        title="Generate Mock Interview" 
        description="Select a role, paste a job description, and let PrepPilot AI craft the perfect tailored interview session for you."
        icon={Sparkles}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-3xl bg-white p-8 rounded-[20px] shadow-sm border border-slate-200"
      >
        <p className="text-slate-600 mb-8 leading-relaxed">
          The interview generation form will appear here. You'll be able to specify role titles, seniority levels, and technical stacks to focus the AI's questions.
        </p>
        
        {/* Placeholder for future form components */}
        <div className="space-y-6">
          <div className="h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 w-full opacity-60">
            <span className="text-slate-400 text-sm">Select Role...</span>
          </div>
          <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-start p-4 w-full opacity-60">
            <span className="text-slate-400 text-sm">Paste Job Description...</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2">
            <Play size={18} />
            Start Interview
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Generate;

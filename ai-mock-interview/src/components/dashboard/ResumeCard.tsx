import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Edit3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ResumeCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">Current Resume</h2>
        <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
          <Edit3 size={14} />
          Replace
        </Button>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-4 mb-6 border border-slate-100 group hover:border-blue-100 transition-colors">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <FileText size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Software_Engineer_Resume.pdf</h3>
          <p className="text-sm text-slate-500 mt-1">Uploaded on Oct 12, 2026 • 2.4 MB</p>
        </div>
        <button className="text-slate-400 hover:text-blue-600 transition-colors bg-white p-2 rounded-full shadow-sm">
          <Download size={18} />
        </button>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Detected Skills</h4>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Node.js', 'System Design', 'AWS'].map((skill, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
            >
              <CheckCircle2 size={12} className="text-blue-500" />
              {skill}
            </span>
          ))}
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            +8 more
          </span>
        </div>
      </div>
    </motion.div>
  );
};

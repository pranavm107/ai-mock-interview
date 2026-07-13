import React from 'react';
import type { Resume } from '../../types';
import { ResumeCard } from './ResumeCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';

interface ResumeListProps {
  resumes: Resume[];
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ResumeList: React.FC<ResumeListProps> = ({ 
  resumes, 
  onSetDefault, 
  onDelete
}) => {
  if (resumes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl border-border bg-card/50"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No resumes uploaded</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload your first resume to get started. We'll use it to tailor your AI mock interviews.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {resumes.map(resume => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onSetDefault={onSetDefault}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

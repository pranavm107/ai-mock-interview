import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { EmptyState } from '../components/dashboard/EmptyState';
import { motion } from 'framer-motion';

const Resume: React.FC = () => {
  return (
    <div className="pb-24">
      <PageHeader 
        title="Resume Manager" 
        description="Upload, manage, and organize your resumes so PrepPilot AI can tailor your mock interviews perfectly."
        icon={FileText}
        actionLabel="Upload Resume"
        actionIcon={Upload}
        actionTo="/resume" // For now just points to itself
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <EmptyState 
          title="No resumes uploaded"
          description="You haven't uploaded any resumes yet. Upload a PDF to automatically extract your skills and experiences."
          icon={FileText}
          actionLabel="Upload Resume"
          actionTo="/resume"
        />
      </motion.div>
    </div>
  );
};

export default Resume;

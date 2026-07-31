import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { ResumeList } from '../components/resume/ResumeList';
import { useResume } from '../hooks/useResume';
import { motion } from 'framer-motion';

const Resume: React.FC = () => {
  const { resumes, loading, error, warning, uploadResume, deleteResume, setDefaultResume } = useResume();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      await uploadResume(file);
    } catch (err) {
      console.error('Failed to upload resume', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader 
        title="Resume Manager" 
        description="Upload, manage, and organize your resumes so PrepPilot AI can tailor your mock interviews perfectly."
        icon={FileText}
      />
      
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {warning && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3 text-yellow-600 dark:text-yellow-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{warning}</p>
        </div>
      )}

      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Upload New Resume</h2>
          <ResumeUpload onUpload={handleUpload} isUploading={isUploading} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Resumes</h2>
            <div className="text-sm text-muted-foreground">
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </div>
          </div>
          
          {loading && resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading resumes...</p>
            </div>
          ) : (
            <ResumeList 
              resumes={resumes} 
              onSetDefault={setDefaultResume} 
              onDelete={deleteResume} 
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Resume;

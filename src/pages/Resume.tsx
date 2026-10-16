import React, { useState } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { ResumeList } from '../components/resume/ResumeList';
import { useResume } from '../hooks/useResume';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
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
    <div className="pb-12 max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <AppBreadcrumb items={[
        { label: 'Library' },
        { label: 'Resume Manager', path: '/resume' }
      ]} />
      <PageHeader 
        title="Resume Manager" 
        description="Upload, manage, and organize your resumes so PrepPilot AI can tailor your mock interviews perfectly."
        icon={FileText}
      />
      
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2.5 text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{error}</p>
        </div>
      )}

      {warning && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2.5 text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{warning}</p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-xl shadow-xs"
        >
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 mb-3">Upload New Resume</h2>
          <ResumeUpload onUpload={handleUpload} isUploading={isUploading} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">Your Resumes</h2>
            <div className="text-xs text-slate-500">
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </div>
          </div>
          
          {loading && resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mb-3 text-blue-600" />
              <p className="text-xs sm:text-sm">Loading resumes...</p>
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

import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'extracting' | 'cleaning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;
    if (isUploading && status === 'uploading') {
      timeout1 = setTimeout(() => {
        setStatus('extracting');
        timeout2 = setTimeout(() => {
           setStatus('cleaning');
        }, 1500);
      }, 1500);
    } else if (!isUploading && (status === 'uploading' || status === 'extracting' || status === 'cleaning')) {
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [isUploading, status]);

  const validateAndUpload = async (file: File) => {
    setErrorMessage('');
    if (file.type !== 'application/pdf') {
      setStatus('error');
      setErrorMessage("Only PDF files are allowed.");
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setStatus('error');
      setErrorMessage("File exceeds the maximum size of 5MB.");
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    try {
      setStatus('uploading');
      await onUpload(file);
    } catch (err) {
      setStatus('error');
      setErrorMessage("Upload failed. Please try again.");
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  }, [isUploading]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isUploading) return;
    
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
    e.target.value = '';
  }, [isUploading]);

  return (
    <div className="w-full">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : status === 'error'
            ? 'border-destructive/50 bg-destructive/5'
            : status === 'success'
            ? 'border-green-500/50 bg-green-500/10'
            : 'border-border/50 hover:border-primary/50 hover:bg-white/5'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading || status === 'success'}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <AnimatePresence mode="wait">
            {(status === 'uploading' || status === 'extracting' || status === 'cleaning') || (isUploading && status !== 'error' && status !== 'success') ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 flex flex-col items-center"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-4 text-sm font-medium text-primary">
                  {status === 'cleaning' ? 'Cleaning Resume...' : status === 'extracting' ? 'Extracting PDF...' : 'Uploading...'}
                </p>
              </motion.div>
            ) : status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 flex flex-col items-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <p className="mt-2 text-sm font-medium text-green-500">Completed</p>
              </motion.div>
            ) : status === 'error' ? (
               <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 flex flex-col items-center"
              >
                <XCircle className="w-10 h-10 text-destructive" />
                <p className="mt-2 text-sm font-medium text-destructive">Upload Failed</p>
                <p className="text-xs text-destructive/80 mt-1">{errorMessage}</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 text-muted-foreground group-hover:text-primary transition-colors flex flex-col items-center"
              >
                <UploadCloud className="w-10 h-10" />
                <p className="mb-2 mt-4 text-sm text-foreground font-medium">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF documents only (Max 5MB)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

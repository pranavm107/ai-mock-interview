import React, { useCallback, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onUpload(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, [onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onUpload(file);
      } else {
         alert("Please upload a PDF file.");
      }
    }
  }, [onUpload]);

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
            : 'border-border/50 hover:border-primary/50 hover:bg-white/5'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 text-primary"
              >
                <Loader2 className="w-10 h-10 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 text-muted-foreground group-hover:text-primary transition-colors"
              >
                <UploadCloud className="w-10 h-10" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <p className="mb-2 text-sm text-foreground font-medium">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PDF documents only (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};

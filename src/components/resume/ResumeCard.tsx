import React, { useState } from 'react';
import { FileText, Star, Trash2, Calendar, HardDrive, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Resume } from '../../types';

interface ResumeCardProps {
  resume: Resume;
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ 
  resume, 
  onSetDefault, 
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(resume.id);
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      setIsSettingDefault(true);
      await onSetDefault(resume.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const date = resume.createdAt?.toDate ? resume.createdAt.toDate() : new Date(resume.createdAt?.seconds ? resume.createdAt.seconds * 1000 : resume.createdAt);
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 group
        ${resume.isDefault 
          ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/5' 
          : 'bg-card border-border/50 hover:border-border shadow-sm'
        }
      `}
    >
      {resume.isDefault && (
        <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Default
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${resume.isDefault ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'}`}>
          <FileText className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate" title={resume.metadata?.title || (resume as any).title}>
            {resume.metadata?.title || (resume as any).title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date instanceof Date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown date'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>{formatBytes(resume.metadata?.fileSize || (resume as any).fileSize)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border/50">
        <button
          onClick={handleSetDefault}
          disabled={resume.isDefault || isSettingDefault || isDeleting}
          className={`text-sm font-medium transition-colors flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2
            ${resume.isDefault 
              ? 'text-primary bg-primary/10 cursor-default' 
              : 'text-muted-foreground hover:text-primary hover:bg-primary/5 disabled:opacity-50'
            }`}
        >
          {isSettingDefault ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : resume.isDefault ? (
            <>Active Resume</>
          ) : (
            <>Set as Default</>
          )}
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting || isSettingDefault}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
          title="Delete resume"
        >
          {isDeleting ? (
             <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
             <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

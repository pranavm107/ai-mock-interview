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
      whileHover={{ y: -2 }}
      className={`relative p-3.5 sm:p-4 rounded-xl border transition-all duration-200 group
        ${resume.isDefault
          ? 'bg-blue-50/50 border-blue-200 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
        }
      `}
    >
      {resume.isDefault && (
        <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 z-10">
          <div className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-current" />
            Default
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${resume.isDefault ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors'}`}>
          <FileText className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate" title={resume.metadata?.title || (resume as any).title}>
            {resume.metadata?.title || (resume as any).title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{date instanceof Date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown date'}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{formatBytes(resume.metadata?.fileSize || (resume as any).fileSize)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-slate-100">
        <button
          onClick={handleSetDefault}
          disabled={resume.isDefault || isSettingDefault || isDeleting}
          className={`text-xs font-medium transition-colors flex-1 h-7.5 px-2.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer
            ${resume.isDefault
              ? 'text-blue-700 bg-blue-100/70 cursor-default'
              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50'
            }`}
        >
          {isSettingDefault ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : resume.isDefault ? (
            <>Active Resume</>
          ) : (
            <>Set as Default</>
          )}
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting || isSettingDefault}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          title="Delete resume"
        >
          {isDeleting ? (
             <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
             <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

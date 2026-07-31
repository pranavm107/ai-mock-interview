import React from 'react';
import { Cloud, CloudOff, CloudLightning, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SaveStatus = 'saved' | 'saving' | 'offline' | 'error';

interface Props {
  status: SaveStatus;
}

export const SaveIndicator: React.FC<Props> = ({ status }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-1.5 text-xs font-medium"
      >
        {status === 'saving' && (
          <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
            <Loader2 size={14} className="animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {status === 'saved' && (
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md">
            <Cloud size={14} />
            <span>Saved</span>
          </div>
        )}
        {status === 'offline' && (
          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            <CloudOff size={14} />
            <span>Offline</span>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
            <CloudLightning size={14} />
            <span>Error saving</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  isListening: boolean;
}

export const SpeechWaveAnimation: React.FC<Props> = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-6">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-rose-500 rounded-full"
          animate={{
            height: ['4px', '16px', '4px'],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

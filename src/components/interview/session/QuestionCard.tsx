import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  order: number;
  question: string;
}

export const QuestionCard: React.FC<Props> = ({ order, question }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={order} // re-animate on question change
      className="mb-6"
    >
      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg mb-3">
        Question {order}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 leading-snug">
        {question}
      </h2>
    </motion.div>
  );
};

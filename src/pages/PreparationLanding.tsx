import React from 'react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { BookOpen, Brain, Terminal, BookA, Puzzle, FileSearch, ArrowRight, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PreparationNavigation } from '../components/preparation/PreparationNavigation';

const categories = [
  {
    id: 'aptitude',
    title: 'Aptitude',
    description: 'Practice quantitative and numerical reasoning for standard placement rounds.',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    id: 'technical-mcqs',
    title: 'Technical MCQs',
    description: 'Test your knowledge on OOP, DBMS, OS, Computer Networks, and more.',
    icon: Terminal,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    id: 'verbal-ability',
    title: 'Verbal Ability',
    description: 'Enhance your English grammar, comprehension, and vocabulary skills.',
    icon: BookA,
    color: 'text-rose-600',
    bg: 'bg-rose-100'
  },
  {
    id: 'logical-reasoning',
    title: 'Logical Reasoning',
    description: 'Sharpen your analytical thinking and pattern recognition abilities.',
    icon: Puzzle,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  {
    id: 'resume-based',
    title: 'Resume-Based MCQs',
    description: 'Take a personalized assessment based entirely on the skills in your resume.',
    icon: FileSearch,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100'
  }
];

export const PreparationLanding: React.FC = () => {
  return (
    <div className="pb-24">
      <PreparationNavigation />
      <PageHeader 
        title="Placement Preparation" 
        description="Practise for company placement test rounds with timed assessments and topic-specific practice tests."
        icon={BookOpen}
        actionLabel="View History"
        actionTo="/preparation/history"
        actionIcon={History}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <Link to={`/preparation/${category.id}`} className="block h-full group">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 h-full flex flex-col hover:shadow-lg hover:border-slate-300 transition-all">
                <div className={`w-14 h-14 rounded-2xl ${category.bg} ${category.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <category.icon size={28} strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{category.title}</h3>
                <p className="text-slate-600 text-sm flex-1 leading-relaxed mb-6">{category.description}</p>
                
                <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Start Preparation <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

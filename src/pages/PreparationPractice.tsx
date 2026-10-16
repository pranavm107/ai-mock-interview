import React from 'react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PreparationNavigation } from '../components/preparation/PreparationNavigation';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { categories } from './PreparationLanding';

export const PreparationPractice: React.FC = () => {
  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <div>
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'Practice Mode' }]} />
        <PreparationNavigation />
        <PageHeader 
          title="Practice Categories" 
          description="Select a topic to begin your preparation session."
          icon={BookOpen}
        />
      </div>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <Link to={`/preparation/${category.id}`} className="block h-full group">
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 h-full flex flex-col hover:shadow-md hover:border-slate-300 transition-all">
                  <div className={`w-10 h-10 rounded-lg ${category.bg} ${category.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <category.icon size={20} strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">{category.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm flex-1 leading-relaxed mb-4">{category.description}</p>
                  
                  <div className="mt-auto flex items-center text-xs sm:text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Practice <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

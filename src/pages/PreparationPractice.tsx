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
    <div className="pb-24 max-w-7xl mx-auto space-y-8">
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
                    Practice <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
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

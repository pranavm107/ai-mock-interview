import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PreparationBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const PreparationBreadcrumb: React.FC<PreparationBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-slate-500 font-medium mb-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
      <Link to="/preparation" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 shrink-0">
        <Home size={14} />
        <span>Preparation</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="mx-2 shrink-0 opacity-50" />
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 transition-colors shrink-0">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 shrink-0">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

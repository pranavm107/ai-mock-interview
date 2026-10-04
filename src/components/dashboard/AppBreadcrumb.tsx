import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AppBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-slate-500 font-medium mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
      <Link to="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 shrink-0">
        <Home size={14} />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="mx-2 shrink-0 opacity-50" />
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 transition-colors shrink-0">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 shrink-0 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

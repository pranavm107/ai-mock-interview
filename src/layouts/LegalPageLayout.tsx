import React, { type ReactNode, useEffect } from 'react';
import { Footer } from '../components/Footer';
import { ChevronRight } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  sections: { id: string; title: string }[];
  metaTitle: string;
  metaDescription: string;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children, sections, metaTitle, metaDescription }) => {
  useEffect(() => {
    document.title = metaTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', metaDescription);
  }, [metaTitle, metaDescription]);

  return (
    <div className="flex flex-col w-full bg-white font-sans selection:bg-indigo-100 overflow-x-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-16 pb-24 flex-grow">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{title}</h1>
          <p className="text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          {/* Left Navigation */}
          <div className="lg:w-1/4 shrink-0">
            <div className="sticky top-28 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">Contents</h3>
              <nav className="flex flex-col gap-3 text-sm">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
                    <ChevronRight className="w-4 h-4 mr-1 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-500 shrink-0" />
                    <span>{s.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:w-3/4 max-w-[820px] text-gray-600 leading-[1.8] text-[17px]
            [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-16 [&>h2]:mb-6 [&>h2]:scroll-mt-28 [&>h2:first-child]:mt-0
            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:scroll-mt-28
            [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2
            [&>a]:text-indigo-600 [&>a]:hover:underline [&>a]:focus:outline-none [&>a]:focus:ring-2 [&>a]:focus:ring-indigo-500 [&>a]:rounded
          ">
            {children}
            
            <div className="mt-16 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-400 italic">
                This page provides general information about PrepPilot AI's policies and is not a substitute for legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalPageLayout;

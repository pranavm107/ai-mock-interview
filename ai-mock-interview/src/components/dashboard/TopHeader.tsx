import React from 'react';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export const TopHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Global Search */}
        <div className="hidden lg:block relative group w-80 xl:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search interviews, resumes, reports..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-12 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 text-slate-900"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden xl:inline-flex items-center justify-center rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:block">
          <HelpCircle size={20} />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="md:hidden">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        </div>
      </div>
    </header>
  );
};

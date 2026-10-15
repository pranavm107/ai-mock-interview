import React from 'react';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export const TopHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-3.5 sm:px-6 h-14 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Mobile Sidebar Trigger & Brand */}
        <div className="md:hidden flex items-center gap-1.5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px]">
              <Sidebar isMobile onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-sm tracking-tight text-slate-900">PrepPilot AI</span>
        </div>

        {/* Global Search */}
        <div className="hidden lg:block relative group w-72 xl:w-88">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search interviews, resumes, questions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-11 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 text-slate-800"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden xl:inline-flex items-center justify-center rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          aria-label="Notifications"
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
        </button>

        <button
          aria-label="Help & Documentation"
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:block"
        >
          <HelpCircle size={18} />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

        <div className="md:hidden flex items-center pl-0.5">
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
        </div>
      </div>
    </header>
  );
};

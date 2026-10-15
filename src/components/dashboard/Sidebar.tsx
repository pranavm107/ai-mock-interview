import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../Logo';
import { 
  LayoutDashboard, 
  Sparkles, 
  History, 
  FileText, 
  BarChart3, 
  Trophy, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Compass,
  BookOpen,
  Code2
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  activePaths?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'HOME',
    items: [
      { name: 'Home', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'PRACTICE',
    items: [
      { 
        name: 'Mock Interviews', 
        path: '/generate', 
        icon: Sparkles,
        activePaths: ['/generate', '/interview', '/session', '/report', '/replay', '/review']
      },
      { 
        name: 'Assessments', 
        path: '/preparation', 
        icon: BookOpen,
        activePaths: ['/preparation']
      },
      {
        name: 'Coding Practice',
        path: '/coding',
        icon: Code2,
        activePaths: ['/coding']
      }
    ]
  },
  {
    title: 'CAREER',
    items: [
      { name: 'Career Coach', path: '/career', icon: Compass }
    ]
  },
  {
    title: 'PROGRESS',
    items: [
      { name: 'History', path: '/history', icon: History },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Achievements', path: '/achievements', icon: Trophy }
    ]
  },
  {
    title: 'LIBRARY',
    items: [
      { name: 'Resume Manager', path: '/resume', icon: FileText }
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings }
    ]
  }
];

export const Sidebar: React.FC<{ isMobile?: boolean; onNavigate?: () => void }> = ({ isMobile = false, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  useEffect(() => {
    if (location.pathname.includes('/workspace')) {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isMobile ? '100%' : (isCollapsed ? '80px' : '260px') }}
      className={`${isMobile ? 'flex' : 'hidden md:flex'} flex-col h-screen bg-white border-r border-slate-200 relative z-30`}
    >
      <div className="flex items-center justify-between px-5 py-3 h-14 border-b border-slate-100">
        <AnimatePresence>
          {(!isCollapsed || isMobile) && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Link to="/dashboard" onClick={() => onNavigate?.()} className="flex items-center overflow-hidden whitespace-nowrap">
                <Logo className="h-6" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && !isMobile && (
          <Link to="/dashboard" onClick={() => onNavigate?.()}>
            <Logo className="w-8 h-8" showText={false} />
          </Link>
        )}
      </div>

      {!isMobile && (
        <button
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-4 bg-white border border-slate-200 rounded-full p-1 shadow-xs hover:shadow-sm hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600 z-40 flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
        </button>
      )}

      <nav className="flex-1 min-h-0 px-3.5 py-2 space-y-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2.5 mb-1 text-[11px] font-bold tracking-wider text-slate-400"
                >
                  {group.title}
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const isActive = item.activePaths
                ? item.activePaths.some((p: string) => location.pathname.startsWith(p))
                : location.pathname.startsWith(item.path);
                
              return (
                <Link key={item.name} to={item.path} onClick={() => onNavigate?.()}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100/50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <item.icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                    <AnimatePresence>
                      {(!isCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="whitespace-nowrap text-xs sm:text-sm"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <AnimatePresence>
        {(!isCollapsed || isMobile) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-blue-500/15 blur-xl"></div>
            <div className="relative z-10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="bg-white/10 p-1 rounded-md">
                    <Zap size={13} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="font-semibold text-xs tracking-wide">PrepPilot Pro</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-blue-500/30 text-blue-300">New</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">Unlimited AI interviews & deep analytics.</p>
              <button className="w-full mt-0.5 bg-white text-slate-900 text-xs font-semibold py-1.5 px-2.5 rounded-lg shadow-sm hover:bg-slate-100 transition-all">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-2.5 m-3 mt-0 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
        <div className={`flex items-center gap-2.5 w-full ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="shrink-0 bg-white rounded-full shadow-sm p-0.5 border border-slate-200">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </div>
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden flex flex-col"
              >
                <span className="text-xs font-semibold text-slate-900 truncate tracking-tight">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-[11px] text-slate-500 truncate font-medium">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Generate Interview', path: '/generate', icon: Sparkles },
  { name: 'Interview History', path: '/history', icon: History },
  { name: 'Resume Manager', path: '/resume', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '88px' : '280px' }}
      className="hidden md:flex flex-col h-screen bg-white border-r border-slate-200 relative z-30"
    >
      <div className="flex items-center justify-between p-6 h-20 mb-2">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  P
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">
                  PrepPilot AI
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <Link to="/dashboard">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              P
            </div>
          </Link>
        )}
      </div>

      <button 
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-24 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600 z-40 flex items-center justify-center"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link key={item.name} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-5 mx-4 mb-4 rounded-[20px] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                </div>
                <span className="font-semibold text-sm">Upgrade to Pro</span>
              </div>
              <p className="text-[13px] text-slate-300 mb-2 leading-relaxed">Get unlimited interviews and advanced analytics.</p>
              <button className="w-full bg-white text-slate-900 text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all">
                Upgrade Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 m-4 mt-0 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
        <div className={`flex items-center gap-3 w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="shrink-0 bg-white rounded-full shadow-sm p-0.5 border border-slate-200">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-10 h-10' } }} />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden flex flex-col"
              >
                <span className="text-sm font-semibold text-slate-900 truncate tracking-tight">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-xs text-slate-500 truncate font-medium">
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

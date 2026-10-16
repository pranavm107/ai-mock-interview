import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { Logo } from '../Logo';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            className="fixed bottom-20 right-5 w-76 sm:w-80 h-92 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col z-40 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2.5 text-white flex items-center justify-between shadow-2xs z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center">
                  <Logo className="w-7 h-7" showText={false} variant="reversed" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm">PrepPilot AI</h3>
                  <p className="text-[10px] text-blue-100 font-medium">Career Coach</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close AI Assistant"
                className="p-1 hover:bg-white/20 rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 p-3 bg-slate-50 overflow-y-auto flex flex-col gap-2.5">
              <div className="bg-white p-2.5 rounded-lg shadow-2xs max-w-[88%] self-start border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                Hi there! I'm your AI career coach. How can I help you prepare today?
              </div>
              <div className="bg-blue-600 text-white p-2.5 rounded-lg shadow-2xs max-w-[88%] self-end text-xs font-medium leading-relaxed">
                Can you give me tips for a System Design interview?
              </div>
              <div className="bg-white p-2.5 rounded-lg shadow-2xs max-w-[88%] self-start border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                Absolutely! For System Design, remember the PEDALS framework: 
                <br/><br/>
                1. <b className="text-slate-900">Process Requirements</b><br/>
                2. <b className="text-slate-900">Estimate Scope</b><br/>
                3. <b className="text-slate-900">Design High-Level Architecture</b>
              </div>
            </div>
            
            <div className="p-2.5 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask for advice..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-3 pr-8 text-xs outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <button
                  aria-label="Send message"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Career Coach"
        className="fixed bottom-5 right-5 w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md flex items-center justify-center text-white z-40 hover:shadow-indigo-500/25 transition-all border-2 border-white"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </motion.button>
    </>
  );
};

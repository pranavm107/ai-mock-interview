import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col z-40 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PrepPilot AI</h3>
                  <p className="text-xs text-blue-100 font-medium">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-4">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] self-start border border-slate-100 text-sm text-slate-700 font-medium leading-relaxed">
                Hi there! I'm your AI career coach. How can I help you prepare today?
              </div>
              <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] self-end text-sm font-medium leading-relaxed">
                Can you give me tips for a System Design interview?
              </div>
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] self-start border border-slate-100 text-sm text-slate-700 font-medium leading-relaxed">
                Absolutely! For System Design, remember the PEDALS framework: 
                <br/><br/>
                1. <b className="text-slate-900">Process Requirements</b><br/>
                2. <b className="text-slate-900">Estimate</b><br/>
                3. <b className="text-slate-900">Design High-Level</b><br/>
                ...
              </div>
            </div>
            
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask for advice..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                  <Send size={14} />
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white z-40 hover:shadow-indigo-500/30 transition-all border-4 border-white"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </>
  );
};

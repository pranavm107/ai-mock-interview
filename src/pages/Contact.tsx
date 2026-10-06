import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Contact: React.FC = () => {
  return (
    <div className="flex flex-col w-full bg-white text-slate-900 font-sans pt-12 pb-24 md:pt-20">
      
      <section className="px-6 max-w-4xl mx-auto text-center mb-16">
        <motion.h1 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6"
        >
          Questions? <span className="text-indigo-600">We're Here.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
        >
          Reach out if you need assistance with your account, have questions about our methodology, or want to discuss enterprise deployments.
        </motion.p>
      </section>

      <section className="px-6 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email Support</h3>
                  <p className="text-slate-500 mb-1">For account issues and general inquiries.</p>
                  <a href="mailto:support@preppilot.ai" className="text-indigo-600 font-medium hover:underline">support@preppilot.ai</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Enterprise Sales</h3>
                  <p className="text-slate-500 mb-1">For teams, bootcamps, and organizations.</p>
                  <a href="mailto:sales@preppilot.ai" className="text-indigo-600 font-medium hover:underline">sales@preppilot.ai</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Headquarters</h3>
                  <p className="text-slate-500">
                    San Francisco, California<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="bg-slate-50 p-8 rounded-3xl border border-slate-100"
        >
          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
                  placeholder="Jane"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
                placeholder="jane@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</label>
              <select 
                id="subject" 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white text-slate-700 appearance-none"
              >
                <option value="support">Technical Support</option>
                <option value="sales">Sales & Enterprise</option>
                <option value="feedback">Product Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
              <textarea 
                id="message" 
                rows={4}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white resize-none"
                placeholder="How can we help?"
              ></textarea>
            </div>
            
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 text-base font-medium mt-2 transition-colors">
              Send Message
            </Button>
          </form>
        </motion.div>
      </section>

    </div>
  );
};

export default Contact;

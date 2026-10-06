import React from 'react';
import { motion } from 'framer-motion';
import { SignUpButton } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';
import { Check } from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Pricing: React.FC = () => {
  return (
    <div className="flex flex-col w-full bg-white text-slate-900 font-sans pt-12 pb-24 md:pt-20">
      
      <section className="px-6 max-w-4xl mx-auto text-center mb-20">
        <motion.h1 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6"
        >
          Simple, Transparent <span className="text-indigo-600">Pricing</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
        >
          Start preparing today. Upgrade when you need more advanced capabilities and unlimited practice.
        </motion.p>
      </section>

      <section className="px-6 max-w-6xl mx-auto w-full">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Free Tier */}
          <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
            <p className="text-slate-500 mb-6">For getting started and testing the platform.</p>
            <div className="text-4xl font-black text-slate-900 mb-8">$0<span className="text-lg font-medium text-slate-500">/month</span></div>
            
            <SignUpButton mode="modal">
              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full h-12 font-semibold mb-8 transition-colors">
                Get Started
              </Button>
            </SignUpButton>
            
            <div className="space-y-4 flex-1">
              {[
                "1 Resume upload",
                "3 Basic mock interviews/month",
                "Text-based feedback",
                "Community support"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pro Tier */}
          <motion.div variants={fadeUp} className="bg-slate-900 border border-slate-900 rounded-3xl p-8 flex flex-col shadow-xl relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Recommended
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-slate-400 mb-6">For serious interview preparation.</p>
            <div className="text-4xl font-black text-white mb-8">$29<span className="text-lg font-medium text-slate-400">/month</span></div>
            
            <SignUpButton mode="modal">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-full h-12 font-semibold mb-8 transition-colors shadow-sm">
                Start Pro Trial
              </Button>
            </SignUpButton>
            
            <div className="space-y-4 flex-1">
              {[
                "Unlimited Resume uploads",
                "Unlimited Mock Interviews",
                "Real-time voice interviews",
                "Advanced Readiness Analytics",
                "Detailed AI performance reports",
                "Targeted micro-assessments"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Teams Tier */}
          <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Teams</h3>
            <p className="text-slate-500 mb-6">For bootcamps and organizations.</p>
            <div className="text-4xl font-black text-slate-900 mb-8">Custom</div>
            
            <Button variant="outline" className="w-full border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900 rounded-full h-12 font-semibold mb-8 transition-colors">
              Contact Sales
            </Button>
            
            <div className="space-y-4 flex-1">
              {[
                "Everything in Pro",
                "Centralized billing",
                "Cohort performance tracking",
                "Custom interview templates",
                "Dedicated account manager",
                "API access"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* FAQ Link */}
      <section className="mt-24 px-6 text-center">
        <p className="text-slate-600">
          Have questions about our pricing? <a href="/contact" className="text-indigo-600 font-semibold hover:underline">Contact us</a>
        </p>
      </section>

    </div>
  );
};

export default Pricing;

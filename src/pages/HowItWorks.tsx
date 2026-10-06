import React from 'react';
import { motion } from 'framer-motion';
import { SignUpButton } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';
import { FileUp, Target, Mic, Award, Search, TrendingUp, ShieldCheck } from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Build Your Profile",
      desc: "Upload your existing PDF resume. PrepPilot's intelligence engine automatically extracts your skills, past projects, and technical stack to build an accurate candidate profile.",
      icon: FileUp
    },
    {
      num: "02",
      title: "Choose Your Interview",
      desc: "Select the specific role you are targeting (e.g., Senior Frontend Engineer). The platform configures the AI persona, difficulty level, and domain context accordingly.",
      icon: Target
    },
    {
      num: "03",
      title: "Practice in Real Time",
      desc: "Enter a live interview session. You'll be asked dynamic, resume-specific questions. Answer naturally using your microphone, and handle adaptive follow-up questions.",
      icon: Mic
    },
    {
      num: "04",
      title: "Receive AI Evaluation",
      desc: "Immediately after the session, receive a comprehensive evaluation scoring your technical accuracy, communication style, and confidence, along with actionable feedback.",
      icon: Award
    },
    {
      num: "05",
      title: "Discover Weak Areas",
      desc: "Over multiple sessions, the Readiness Dashboard aggregates your data to identify recurring weak points across specific domains or behavioral frameworks.",
      icon: Search
    },
    {
      num: "06",
      title: "Practice Targeted Skills",
      desc: "Don't repeat full interviews blindly. Generate targeted, bite-sized practice sessions for the exact topics you need to improve.",
      icon: TrendingUp
    },
    {
      num: "07",
      title: "Return Stronger",
      desc: "Measure your progress over time, watch your readiness score climb, and walk into the real interview with tested confidence.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="flex flex-col w-full bg-white text-slate-900 font-sans pt-12 pb-24 md:pt-20">
      
      {/* Header */}
      <section className="px-6 max-w-4xl mx-auto text-center mb-24">
        <motion.h1 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6"
        >
          The Journey to <br/>
          <span className="text-indigo-600">Interview Mastery</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
        >
          A systematic, data-driven approach to preparing for your next career move. Here's exactly how PrepPilot helps you succeed.
        </motion.p>
      </section>

      {/* Journey Timeline */}
      <section className="px-6 max-w-4xl mx-auto w-full relative">
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 md:-translate-x-1/2 hidden sm:block"></div>
        
        <div className="flex flex-col gap-16 md:gap-24 relative">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                className={`flex flex-col sm:flex-row items-start md:items-center gap-8 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content Side */}
                <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-start pl-0 md:pl-12' : 'md:justify-end pr-0 md:pr-12'}`}>
                  <div className={`bg-slate-50 p-8 rounded-3xl border border-slate-100 max-w-md ${isEven ? 'text-left' : 'md:text-right text-left'}`}>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Center Node */}
                <div className="hidden sm:flex absolute left-8 md:left-1/2 md:-translate-x-1/2 w-12 h-12 bg-white border-4 border-indigo-100 rounded-full items-center justify-center shadow-sm z-10 text-indigo-600">
                  <step.icon className="w-5 h-5" />
                </div>

                {/* Number Side (Desktop Only) */}
                <div className={`hidden md:flex w-1/2 ${isEven ? 'justify-end pr-12' : 'justify-start pl-12'}`}>
                  <div className="text-6xl font-black text-slate-100 tracking-tighter">
                    {step.num}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Ready to begin?</h2>
        <p className="text-slate-600 mb-10 max-w-lg mx-auto">
          Set up your profile in 60 seconds and start your first mock interview immediately.
        </p>
        <SignUpButton mode="modal">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-14 text-lg font-medium shadow-sm transition-all">
            Build Your Profile
          </Button>
        </SignUpButton>
      </section>

    </div>
  );
};

export default HowItWorks;

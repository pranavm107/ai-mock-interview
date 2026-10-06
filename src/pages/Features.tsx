import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Mic, Target, Brain, 
  Settings, Award, LineChart, MessageSquare
} from 'lucide-react';
import { SignUpButton } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Features: React.FC = () => {
  const features = [
    {
      title: "Resume Intelligence",
      icon: FileText,
      what: "Upload your PDF resume and let our engine extract your key skills, past projects, and technical stack to build your profile.",
      why: "Generic questions don't test your actual experience. By anchoring the interview on your resume, you prepare for the specific questions hiring managers will actually ask you."
    },
    {
      title: "Smart Interview Setup",
      icon: Settings,
      what: "Configure your target role, seniority level, and company type. The platform fine-tunes the AI persona and evaluation criteria.",
      why: "A Junior Developer interview at a startup is completely different from a Staff Engineer interview at an enterprise. Your practice should reflect your specific goal."
    },
    {
      title: "AI Mock Interviews",
      icon: Brain,
      what: "Engage in full-length technical or behavioral interviews driven by Google's Groq AI, simulating real conversational flow.",
      why: "Practicing alone in a mirror doesn't simulate the pressure or the unexpected nature of a real interview. AI provides a realistic, low-stakes environment to build confidence."
    },
    {
      title: "Adaptive Follow-ups",
      icon: MessageSquare,
      what: "The AI interviewer listens to your responses and generates spontaneous follow-up questions to dig deeper into your answers.",
      why: "Real interviewers don't just read from a script; they probe your knowledge boundaries. Handling adaptive follow-ups is the key to demonstrating true seniority."
    },
    {
      title: "Voice Interviews",
      icon: Mic,
      what: "Speak your answers naturally using our real-time voice integration powered by Deepgram, rather than typing them out.",
      why: "Verbalizing technical concepts clearly is a distinct skill from knowing the answer. Practicing out loud reduces filler words and improves structural clarity."
    },
    {
      title: "Professional Feedback",
      icon: Award,
      what: "Receive an extensive post-interview report scoring your technical accuracy, communication style, and confidence, with specific suggestions.",
      why: "Without feedback, you reinforce bad habits. Granular scoring helps you understand exactly how an evaluator perceives your responses."
    },
    {
      title: "Readiness Intelligence",
      icon: LineChart,
      what: "Track your aggregated performance across multiple sessions to visualize your overall interview readiness and identify recurring weaknesses.",
      why: "It's difficult to know when you're actually ready. Data-driven readiness scores give you the green light to confidently schedule your real interviews."
    },
    {
      title: "Targeted Practice",
      icon: Target,
      what: "Take bite-sized, domain-specific assessments generated specifically to address the weak areas identified in your full mock interviews.",
      why: "You shouldn't have to take a full 45-minute mock interview just to practice system design. Targeted practice optimizes your preparation time."
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
          Everything You Need to <br/>
          <span className="text-indigo-600">Prepare With Confidence</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 leading-relaxed"
        >
          A comprehensive suite of tools designed to simulate real interview conditions, measure your performance, and target your weaknesses.
        </motion.p>
      </section>

      {/* Feature List */}
      <section className="px-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-12">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-100"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <feature.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-2">What it does</h4>
                    <p className="text-slate-700 leading-relaxed">{feature.what}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-2">Why it matters</h4>
                    <p className="text-slate-700 leading-relaxed">{feature.why}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Experience the Platform</h2>
        <p className="text-slate-600 mb-10">Stop guessing. Start practicing with intelligent, realistic interviews today.</p>
        <SignUpButton mode="modal">
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 h-14 text-lg font-medium">
            Get Started For Free
          </Button>
        </SignUpButton>
      </section>

    </div>
  );
};

export default Features;

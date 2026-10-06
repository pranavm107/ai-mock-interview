import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { SignUpButton } from '@clerk/clerk-react';
import {
  ArrowRight, Brain, Briefcase, FileText,
  Target, Mic, LineChart, ChevronDown, ChevronUp, CheckCircle2, ChevronRight
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full bg-white overflow-hidden text-slate-900">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-start text-left z-10"
          >
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Prepare Smarter.<br />
              Interview Better.<br />
              <span className="text-indigo-600">Get Hired.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Practice realistic AI-powered interviews, uncover your weaknesses with professional feedback, and improve through targeted preparation.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-14 text-base font-semibold shadow-sm transition-all w-full sm:w-auto">
                  Start Practicing
                </Button>
              </SignUpButton>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-medium border-slate-200 hover:border-slate-300 hover:bg-slate-50 w-full sm:w-auto transition-all">
                  Explore How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full h-full max-w-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 bg-slate-100">
              <img 
                src="/images/marketing/preppilot-hero-interview.jpg" 
                alt="Candidate preparing for an interview" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">
                Interview preparation shouldn't be a guessing game.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-8 leading-relaxed">
                Most candidates prepare by reading generic questions or practicing in a mirror. But real interviews are dynamic, conversational, and require adapting to unexpected follow-ups.
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg text-slate-600 leading-relaxed">
                PrepPilot bridges the gap. By simulating real interview conditions tailored to your exact resume and target role, you build genuine confidence instead of just memorizing answers.
              </motion.p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-6"
            >
              {[
                "Targeted mock interviews based on your resume",
                "Adaptive follow-up questions from AI",
                "Real-time voice and text interaction",
                "Detailed feedback on technical and behavioral skills"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Core Capabilities</h2>
            <p className="text-lg text-slate-600">
              Everything you need to master your next technical or behavioral interview, packed into one powerful platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Resume Intelligence",
                desc: "Upload your resume and target role. The AI generates tailored questions specific to your past projects and required skills."
              },
              {
                icon: Mic,
                title: "Realistic Voice Sessions",
                desc: "Practice in a realistic environment with spoken questions and adaptive follow-ups, just like a real conversation."
              },
              {
                icon: Target,
                title: "Actionable Feedback",
                desc: "Receive granular scores on communication, technical accuracy, and confidence immediately after finishing."
              },
              {
                icon: Brain,
                title: "Readiness Tracking",
                desc: "Identify your weak areas across multiple sessions and track your improvement visually over time."
              },
              {
                icon: Briefcase,
                title: "Role-Specific Models",
                desc: "Practice with models trained for specific domains like Software Engineering, Product Management, or Data Science."
              },
              {
                icon: LineChart,
                title: "Targeted Practice",
                desc: "Take quick assessments to isolate and improve the specific behavioral or technical skills holding you back."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-indigo-100 hover:shadow-sm transition-all"
              >
                <feature.icon className="w-8 h-8 text-indigo-600 mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (The Loop) */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">The Preparation Loop</h2>
            <p className="text-slate-400 text-lg">A systematic approach to interview readiness.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-12 right-12 h-px bg-slate-800" />
            
            {[
              { step: "01", title: "Practice", desc: "Run a full simulated interview based on your profile." },
              { step: "02", title: "Measure", desc: "Review your detailed performance report and scoring." },
              { step: "03", title: "Identify", desc: "Discover specific weaknesses in your readiness analytics." },
              { step: "04", title: "Improve", desc: "Take targeted micro-assessments to fix knowledge gaps." }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold mb-6 border-4 border-slate-900">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Ready to start preparing?</h2>
          <p className="text-lg text-slate-600 mb-10">
            Join candidates using PrepPilot AI to refine their skills and land their next role.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 h-14 text-lg font-medium">
              Start Your Mock Interview
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">PrepPilot AI</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">
                AI-powered interview preparation that feels credible, intelligent, and human.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Features</Link></li>
                <li><Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-sm text-slate-500 flex justify-between items-center">
            <p>© {new Date().getFullYear()} PrepPilot AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

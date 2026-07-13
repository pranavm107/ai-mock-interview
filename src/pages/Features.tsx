import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, FileText, Cloud,
  CheckCircle2, Code, Database, Bot, Layout, Server, Users, 
  MessageSquare, LineChart, Sparkles, Zap, Check, Lock, MonitorSmartphone,
  Star, Upload, FileUp, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Globe, Mail, MessageCircle,
  X, Gauge, SearchCode, Braces, RefreshCw, Layers, Clock, Cpu, Network, Briefcase, Mic, CheckSquare, FastForward, LockKeyhole, Fingerprint
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div variants={fadeUp} className="group h-full">
    <Card className="h-full border border-gray-200 shadow-sm rounded-2xl hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden group-hover:-translate-y-2">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      <CardContent className="p-8">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
        <div className="mt-auto flex items-center text-sm font-semibold text-indigo-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Learn more <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Features: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full bg-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] opacity-70 -z-10 animate-pulse"></div>
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] opacity-70 -z-10"></div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10">
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-8 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 w-max shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Powerful AI Interview Platform
              </Badge>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Explore Everything <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">PrepPilot AI</span> Can Do
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              From resume analysis to AI-generated interviews and detailed performance analytics, PrepPilot AI helps you prepare smarter and get hired faster.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Start Free Interview
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="rounded-xl px-8 h-14 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                  View Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative h-[600px] w-full flex items-center justify-center perspective-1000">
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
              {/* Central Element */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute z-20 w-32 h-32 bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center">
                 <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center">
                   <Brain className="w-12 h-12 text-indigo-600 animate-pulse" />
                 </div>
              </motion.div>

              {/* Orbiting Cards */}
              <motion.div animate={{ y: [0, 15, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-1/4 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-30">
                <div className="bg-emerald-100 p-2 rounded-lg"><Upload className="w-6 h-6 text-emerald-600" /></div>
                <div><div className="text-sm font-bold">Resume Upload</div><div className="text-xs text-gray-500">Parsed & Analyzed</div></div>
              </motion.div>
              
              <motion.div animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }} className="absolute bottom-1/4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-30">
                <div className="bg-sky-100 p-2 rounded-lg"><LineChart className="w-6 h-6 text-sky-600" /></div>
                <div><div className="text-sm font-bold">AI Feedback</div><div className="text-xs text-gray-500">Instant Reports</div></div>
              </motion.div>

              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} className="absolute top-1/3 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                <div className="bg-purple-100 p-2 rounded-lg"><Target className="w-6 h-6 text-purple-600" /></div>
                <div><div className="text-sm font-bold">Interview Score</div><div className="text-xs text-gray-500">92% Average</div></div>
              </motion.div>
              
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 5.5, delay: 1.5 }} className="absolute bottom-1/3 left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                <div className="bg-indigo-100 p-2 rounded-lg"><Bot className="w-6 h-6 text-indigo-600" /></div>
                <div><div className="text-sm font-bold">Gemini AI</div><div className="text-xs text-gray-500">Engine Active</div></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE FEATURES GRID */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Core Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Everything you need to master your technical, behavioral, and leadership interviews.</p>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Resume-Based Interviews", desc: "AI deeply analyzes your resume to tailor highly specific questions to your experience." },
              { icon: Brain, title: "Gemini AI Generator", desc: "Powered by state-of-the-art LLMs trained on actual interviews." },
              { icon: MessageSquare, title: "Adaptive Follow-ups", desc: "AI asks dynamic follow-up questions based on your previous answers." },
              { icon: Users, title: "Behavioral Practice", desc: "Master the STAR method with behavioral mock scenarios." },
              { icon: Code, title: "Technical Practice", desc: "Deep dive into language-specific concepts and architecture." },
              { icon: Braces, title: "Coding Simulation", desc: "Simulate whiteboard and algorithm scenarios effectively." },
              { icon: Mic, title: "Voice Ready", desc: "Support for natural conversational flow and cadence." },
              { icon: Zap, title: "Instant AI Evaluation", desc: "Receive immediate scoring the moment you finish an answer." },
              { icon: Target, title: "Detailed Reports", desc: "Granular breakdown of technical accuracy and communication." },
              { icon: Clock, title: "Interview History", desc: "Look back at all previous sessions and track improvement." },
              { icon: Briefcase, title: "Role-Based Generation", desc: "Select specific job roles to perfectly match the difficulty." },
              { icon: Cloud, title: "Secure Cloud Storage", desc: "All feedback and resumes are safely backed up to the cloud." },
              { icon: ShieldCheck, title: "Clerk Authentication", desc: "Enterprise-grade secure login and session management." },
              { icon: Database, title: "Firebase Database", desc: "Real-time sync and robust data handling for all users." },
              { icon: Gauge, title: "Fast Loading", desc: "Optimized React architecture for immediate interactions." },
              { icon: MonitorSmartphone, title: "Responsive Design", desc: "Practice flawlessly on your mobile phone, tablet, or desktop." }
            ].map((f, i) => (
              <FeatureCard key={i} icon={f.icon} title={f.title} description={f.desc} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. AI WORKFLOW SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">The AI Workflow</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">A seamless pipeline from upload to actionable feedback.</p>
        </div>
        
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-gray-100 rounded-full">
            <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          </div>

          <div className="flex flex-col lg:flex-row justify-between relative z-10 gap-10 lg:gap-4">
            {[
              { title: "Upload Resume", icon: FileUp },
              { title: "AI Extracts Skills", icon: SearchCode },
              { title: "Generate Questions", icon: Brain },
              { title: "Take Interview", icon: Mic },
              { title: "AI Evaluation", icon: Cpu },
              { title: "Performance Dashboard", icon: LineChart }
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="flex flex-col items-center text-center flex-1">
                <div className="w-20 h-20 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-4 relative shadow-md">
                  <div className="absolute inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">{step.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI FEEDBACK PREVIEW */}
      <section className="py-24 bg-gray-50 border-y border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Granular AI Feedback</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Receive hyper-specific feedback across 5 dimensions instantly.</p>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 max-w-5xl mx-auto relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-10 -z-10"></div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0">
                <div className="relative h-48 w-48 mb-6">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="#f3f4f6" strokeWidth="16" />
                    <motion.circle initial={{ strokeDashoffset: 553 }} whileInView={{ strokeDashoffset: 553 * (1 - 0.92) }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeOut" }} cx="96" cy="96" r="88" fill="transparent" stroke="url(#gradient2)" strokeWidth="16" strokeDasharray="553" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#9333EA" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-black text-gray-900">92<span className="text-2xl">%</span></div>
                    <div className="text-sm font-semibold text-gray-500">Overall Score</div>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 text-sm">Excellent Performance</Badge>
              </div>
              
              <div className="col-span-2 flex flex-col justify-center space-y-6">
                {[
                  { label: "Technical Knowledge", score: 95, color: "bg-indigo-600" },
                  { label: "Communication", score: 88, color: "bg-purple-500" },
                  { label: "Problem Solving", score: 91, color: "bg-emerald-500" },
                  { label: "Confidence", score: 89, color: "bg-sky-500" },
                  { label: "STAR Method", score: 85, color: "bg-amber-500" },
                ].map((metric, idx) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-700">{metric.label}</span>
                      <span className="text-gray-900 font-bold">{metric.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${metric.score}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: idx * 0.1 }} className={`${metric.color} h-full rounded-full`} />
                    </div>
                  </div>
                ))}

                <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium flex gap-3">
                    <X className="w-5 h-5 flex-shrink-0" /> Reduce filler words ("um", "like")
                  </div>
                  <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium flex gap-3">
                    <RefreshCw className="w-5 h-5 flex-shrink-0" /> Improve STAR format structure
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium flex gap-3">
                    <CheckSquare className="w-5 h-5 flex-shrink-0" /> Great technical explanations
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm font-medium flex gap-3">
                    <Target className="w-5 h-5 flex-shrink-0" /> Confident posture and delivery
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. RESUME INTELLIGENCE */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-8 border-b border-gray-100 mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="flex gap-2 mb-6">
                  <Badge variant="outline" className="text-xs">React</Badge>
                  <Badge variant="outline" className="text-xs">Node.js</Badge>
                  <Badge variant="outline" className="text-xs">AWS</Badge>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                <div className="h-3 w-4/6 bg-gray-100 rounded mb-8"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-100 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
              </div>

              {/* Scanning laser animation overlay */}
              <motion.div animate={{ y: [0, 300, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute left-0 top-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10" />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Your Resume Becomes Your Blueprint</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
              No generic question banks. The AI deeply parses your PDF to build an internal model of your career. It analyzes your:
            </motion.p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {['Skills', 'Projects', 'Experience', 'Education', 'Technologies', 'Achievements'].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 font-semibold text-gray-800">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" /> {item}
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeUp} className="text-lg text-gray-600">
              It then generates a bespoke interview script that pushes you exactly where your boundaries are.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 6. INTERVIEW CATEGORIES */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Comprehensive Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Specialized domains calibrated for your specific target role.</p>
          </div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Software Engineering', icon: Code, desc: 'Algorithms & System Design', q: '500+ Qs' },
              { name: 'Frontend', icon: Layout, desc: 'React, UI/UX, Web Core', q: '350+ Qs' },
              { name: 'Backend', icon: Server, desc: 'Databases & APIs', q: '420+ Qs' },
              { name: 'Full Stack', icon: Layers, desc: 'End to End Systems', q: '480+ Qs' },
              { name: 'Data Science', icon: Database, desc: 'Machine Learning & Stats', q: '300+ Qs' },
              { name: 'AI / ML', icon: Brain, desc: 'Deep Learning & NLP', q: '250+ Qs' },
              { name: 'Cloud & DevOps', icon: Cloud, desc: 'AWS, CI/CD, Docker', q: '290+ Qs' },
              { name: 'Cybersecurity', icon: LockKeyhole, desc: 'Network & App Security', q: '200+ Qs' },
              { name: 'HR Interview', icon: Users, desc: 'Cultural Fit', q: '150+ Qs' },
              { name: 'Behavioral', icon: MessageSquare, desc: 'STAR Method Scenarios', q: '200+ Qs' },
              { name: 'Leadership', icon: Target, desc: 'Management & Strategy', q: '120+ Qs' }
            ].map((cat, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <cat.icon className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{cat.desc}</p>
                <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 w-max px-3 py-1 rounded-full">{cat.q}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. WHY PREPPILOT AI? (Comparison) */}
      <section className="py-24 max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Traditional vs PrepPilot AI</h2>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 bg-gray-50 border-b border-gray-200 p-6">
            <div className="hidden md:block font-bold text-gray-500 uppercase tracking-wider text-sm">Feature</div>
            <div className="font-bold text-gray-500 text-center uppercase tracking-wider text-sm">Traditional Prep</div>
            <div className="font-bold text-indigo-600 text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2"><Sparkles className="w-4 h-4"/> PrepPilot AI</div>
          </div>
          {[
            { label: "Questions", trad: "Generic Banks", pp: "Resume Based" },
            { label: "Feedback", trad: "None", pp: "Instant AI Feedback" },
            { label: "Analytics", trad: "No Analytics", pp: "Performance Dashboard" },
            { label: "History", trad: "Lost", pp: "Cloud History" },
            { label: "Personalization", trad: "None", pp: "Deep AI Personalization" }
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-3 p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="hidden md:block font-semibold text-gray-800">{row.label}</div>
              <div className="text-center text-gray-500 flex flex-col md:flex-row items-center justify-center gap-2"><X className="w-4 h-4 text-red-400" /> {row.trad}</div>
              <div className="text-center font-bold text-indigo-700 flex flex-col md:flex-row items-center justify-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> {row.pp}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. TECHNOLOGY STACK */}
      <section className="py-24 bg-gray-900 text-white border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Enterprise Technology Stack</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Built with modern, scalable frameworks for optimal performance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: "React", icon: Code, desc: "Fast UI Rendering" },
              { name: "TypeScript", icon: FileText, desc: "Type-safe Codebase" },
              { name: "Tailwind CSS", icon: Layout, desc: "Utility-first Styling" },
              { name: "Shadcn UI", icon: Layers, desc: "Accessible Components" },
              { name: "Firebase", icon: Database, desc: "Realtime Database" },
              { name: "Clerk", icon: ShieldCheck, desc: "Secure Auth" },
              { name: "Gemini AI", icon: Brain, desc: "Intelligence Layer" },
              { name: "React Router", icon: Network, desc: "Client-side Routing" },
              { name: "Framer Motion", icon: Zap, desc: "Smooth Animations" },
              { name: "Vite", icon: FastForward, desc: "Lightning Build Tool" }
            ].map((tech, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                  <tech.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="font-bold mb-2">{tech.name}</h4>
                <p className="text-xs text-gray-400">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SECURITY & 10. PERFORMANCE SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-indigo-50 rounded-3xl p-10 border border-indigo-100 relative overflow-hidden">
            <Lock className="absolute -right-10 -bottom-10 w-64 h-64 text-indigo-100/50" />
            <h3 className="text-3xl font-bold text-gray-900 mb-6 relative z-10">Bank-Level Security</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-center gap-3 text-gray-700 font-medium"><ShieldCheck className="text-emerald-500" /> Clerk Authentication</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><Database className="text-emerald-500" /> Firebase Security Rules</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><Fingerprint className="text-emerald-500" /> Encrypted User Data</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><Cloud className="text-emerald-500" /> Secure Cloud Storage</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><FileText className="text-emerald-500" /> Private Resume Uploads</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-sky-50 rounded-3xl p-10 border border-sky-100 relative overflow-hidden">
            <Gauge className="absolute -right-10 -bottom-10 w-64 h-64 text-sky-100/50" />
            <h3 className="text-3xl font-bold text-gray-900 mb-6 relative z-10">Blazing Performance</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-center gap-3 text-gray-700 font-medium"><FastForward className="text-sky-600" /> Fast Loading Times</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><Code className="text-sky-600" /> Optimized React Components</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><Layers className="text-sky-600" /> Lazy Loading</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><MonitorSmartphone className="text-sky-600" /> Fully Responsive Design</li>
              <li className="flex items-center gap-3 text-gray-700 font-medium"><Server className="text-sky-600" /> Scalable Architecture</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 11. STATISTICS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { num: "500+", label: "Interview Questions" },
              { num: "50+", label: "Job Roles" },
              { num: "12+", label: "Categories" },
              { num: "100%", label: "AI Generated Feedback" },
              { num: "99.9%", label: "Application Uptime" }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{stat.num}</div>
                <div className="text-indigo-200 font-medium text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. TESTIMONIALS */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Success Stories</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "PrepPilot AI helped me confidently crack my software engineering interview.", name: "Alex R.", role: "Software Engineer" },
              { quote: "The resume-based questions felt exactly like a real interview. Incredible accuracy.", name: "Maria S.", role: "Frontend Developer" },
              { quote: "The AI feedback helped improve my communication significantly. Reduced my filler words.", name: "James T.", role: "Product Manager" }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex text-amber-400 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-700 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. FAQ SECTION */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does PrepPilot AI work?", a: "We use AI to parse your resume, map your skills, and generate a dynamic interview scenario tailored to your background." },
              { q: "Is my resume secure?", a: "Yes. Resumes are processed securely, stored privately on Firebase Cloud Storage, and only accessible by you via Clerk Authentication." },
              { q: "Can I practice unlimited interviews?", a: "Yes, you can generate and practice as many interviews as you like across any category." },
              { q: "Which AI model is used?", a: "We leverage Google's Gemini AI for lightning-fast, highly accurate context processing and natural language generation." },
              { q: "Can I track previous interviews?", a: "Absolutely. The dashboard stores your complete interview history and tracks performance metrics over time." },
              { q: "Is coding interview support available?", a: "Yes, we simulate technical and coding interviews, asking algorithm and architecture questions." }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                <button 
                  className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 py-4 text-gray-600 bg-gray-50">
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. CTA SECTION */}
      <section className="py-24 max-w-6xl mx-auto px-6 w-full">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">Ready to Build Interview Confidence?</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
              Practice personalized interviews with AI and land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-50 rounded-xl px-10 h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  Start Free Interview
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="lg" variant="outline" className="border-indigo-300 text-white bg-transparent hover:bg-white/10 rounded-xl px-10 h-16 text-lg font-bold transition-all">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 15. FOOTER (Reused from Home) */}
      <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 w-full rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-8 h-8 text-indigo-400" />
                PrepPilot AI
              </div>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed text-sm">
                Empowering job seekers with state-of-the-art AI technology to master interviews and accelerate their careers in tech.
              </p>
              
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 tracking-wide text-sm">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 tracking-wide text-sm">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 tracking-wide text-sm">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for interview tips.</p>
              <div className="flex flex-col gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-500">
              © {new Date().getFullYear()} PrepPilot AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;

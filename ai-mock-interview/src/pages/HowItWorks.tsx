import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, FileText, Shield, Cloud,
  CheckCircle2, Code, Database, Bot, Layout, Server, Users, 
  MessageSquare, LineChart, Sparkles, Zap, Check, Lock, MonitorSmartphone,
  Star, Upload, FileUp, Award, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Globe, Mail, MessageCircle,
  X, Gauge, SearchCode, RefreshCw, Layers, Clock, Cpu, Network, Briefcase, Mic, UserCircle, Activity, BarChart, FileSearch, ArrowDown
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const HowItWorks: React.FC = () => {
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
                Simple. Intelligent. Effective.
              </Badge>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">PrepPilot AI</span> Works
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Follow a simple step-by-step journey from uploading your resume to receiving personalized AI-powered interview feedback.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Start Free Interview
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="rounded-xl px-8 h-14 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                  View Features
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative h-[600px] w-full flex items-center justify-center perspective-1000">
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
              
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute z-20 w-32 h-32 bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center">
                 <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                   <Network className="w-12 h-12 text-indigo-600 animate-pulse relative z-10" />
                   <div className="absolute inset-0 bg-indigo-100/50 animate-ping rounded-2xl"></div>
                 </div>
              </motion.div>

              {/* Orbiting Elements */}
              <motion.div animate={{ y: [0, 15, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-1/4 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-30">
                <div className="bg-emerald-100 p-2 rounded-lg"><Upload className="w-6 h-6 text-emerald-600" /></div>
                <div><div className="text-sm font-bold">Resume Upload</div></div>
              </motion.div>
              
              <motion.div animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }} className="absolute bottom-1/4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-30">
                <div className="bg-sky-100 p-2 rounded-lg"><LineChart className="w-6 h-6 text-sky-600" /></div>
                <div><div className="text-sm font-bold">Performance Report</div></div>
              </motion.div>

              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} className="absolute top-1/3 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                <div className="bg-purple-100 p-2 rounded-lg"><MessageSquare className="w-6 h-6 text-purple-600" /></div>
                <div><div className="text-sm font-bold">Interview Questions</div></div>
              </motion.div>
              
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 5.5, delay: 1.5 }} className="absolute bottom-1/3 left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                <div className="bg-indigo-100 p-2 rounded-lg"><Bot className="w-6 h-6 text-indigo-600" /></div>
                <div><div className="text-sm font-bold">Gemini AI</div></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. INTERACTIVE JOURNEY TIMELINE */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">The Interview Journey</h2>
            <p className="text-gray-600 text-lg">9 simple steps from sign up to success.</p>
          </div>

          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-10 md:left-1/2 md:-ml-px top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {[
              { num: 1, icon: UserCircle, title: "Create Your Account", desc: "Sign up using Google or email and create your personalized interview workspace. Securely powered by Clerk Authentication." },
              { num: 2, icon: Briefcase, title: "Complete Your Profile", desc: "Add career information including preferred interview roles, experience level, targeted skills, and dream companies." },
              { num: 3, icon: FileUp, title: "Upload Your Resume", desc: "Upload your latest resume PDF. Our AI automatically extracts your projects, skills, education, and achievements." },
              { num: 4, icon: Brain, title: "AI Resume Analysis", desc: "Gemini AI deeply understands your background, extracting keywords, analyzing experience, and mapping you to target roles." },
              { num: 5, icon: FileSearch, title: "Generate Personalized Interview", desc: "The AI crafts a bespoke interview script matching your resume, chosen difficulty, and specific job role." },
              { num: 6, icon: Mic, title: "Take AI Mock Interview", desc: "Step into a professional interview interface featuring voice-ready support, question timers, and progress tracking." },
              { num: 7, icon: Cpu, title: "AI Evaluation", desc: "Gemini AI instantly evaluates your responses for technical accuracy, communication, confidence, and STAR method usage." },
              { num: 8, icon: Activity, title: "Detailed Report", desc: "Receive a comprehensive report with your overall score, strengths, weaknesses, and question-by-question improvement suggestions." },
              { num: 9, icon: BarChart, title: "Track Progress", desc: "Save your history to Firebase. View your dashboard to track average scores, past interviews, and performance analytics over time." },
            ].map((step, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className={`relative flex items-center justify-between md:justify-normal mb-12 group ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                <div className="hidden md:block md:w-5/12"></div>
                
                {/* Center Timeline Node */}
                <div className="z-10 flex items-center justify-center w-20 h-20 bg-white border-4 border-indigo-100 rounded-full shadow-lg shrink-0 md:mx-auto group-hover:scale-110 group-hover:border-indigo-300 transition-all duration-300 relative">
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {step.num}
                  </div>
                  <step.icon className="w-8 h-8 text-indigo-600" />
                </div>

                {/* Content Card */}
                <div className="w-[calc(100%-6rem)] md:w-5/12 pl-6 md:pl-0">
                  <Card className={`border-none shadow-md hover:shadow-xl transition-shadow bg-white ${idx % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROCESS FLOW DIAGRAM & 5. AI WORKFLOW VISUALIZATION */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">System Architecture Flow</h2>
            <p className="text-gray-600 text-lg">A seamless data pipeline powering your preparation.</p>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 -z-0"></div>
            
            {/* Horizontal Flow Desktop / Vertical Mobile */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
               {[
                 { title: 'Resume', icon: FileText },
                 { title: 'AI Parser', icon: SearchCode },
                 { title: 'Question Gen', icon: Brain },
                 { title: 'Interview Engine', icon: Mic },
                 { title: 'Feedback Gen', icon: Cpu },
                 { title: 'Dashboard', icon: LineChart }
               ].map((item, idx, arr) => (
                 <React.Fragment key={idx}>
                   <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center min-w-[140px] text-white">
                     <item.icon className="w-8 h-8 text-indigo-300 mb-3" />
                     <span className="font-bold text-sm text-center">{item.title}</span>
                   </motion.div>
                   {idx < arr.length - 1 && (
                     <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-indigo-400 rotate-90 lg:rotate-0">
                       <ArrowRight className="w-6 h-6" />
                     </motion.div>
                   )}
                 </React.Fragment>
               ))}
            </div>
          </div>
      </section>

      {/* 4. BEHIND THE SCENES */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">What Happens Behind the Scenes?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">The robust technology driving the PrepPilot AI platform.</p>
          </div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-2 transition-transform">
              <ShieldCheck className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="font-bold text-gray-900 text-xl mb-3">Clerk Authentication</h3>
              <p className="text-gray-600 text-sm">Enterprise-grade secure login, user management, and session handling ensuring your identity is protected.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-2 transition-transform">
              <Database className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="font-bold text-gray-900 text-xl mb-3">Firebase</h3>
              <p className="text-gray-600 text-sm">Robust cloud database securely storing your complete interview history, analytics, and resume documents.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-2 transition-transform">
              <Brain className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-bold text-gray-900 text-xl mb-3">Gemini AI</h3>
              <p className="text-gray-600 text-sm">Google's advanced LLM processes contextual resume data to generate ultra-personalized interview questions.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-2 transition-transform">
              <Code className="w-10 h-10 text-sky-600 mb-4" />
              <h3 className="font-bold text-gray-900 text-xl mb-3">React</h3>
              <p className="text-gray-600 text-sm">A lightning-fast, interactive frontend experience powered by React, Vite, and Framer Motion.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 6. SECURITY SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
         <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-10 md:p-16 text-white overflow-hidden relative">
            <Lock className="absolute -right-10 -bottom-10 w-80 h-80 text-white/5 z-0" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Security at Every Step</h2>
                <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                  Your data privacy and security are our highest priority. The entire pipeline is encrypted and protected.
                </p>
                <Link to="/sign-up">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 h-12">Create Secure Account</Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 {[
                   "Secure Authentication", "Encrypted Database", "Private Interview History", 
                   "Protected Routes", "Secure Resume Uploads", "Cloud Storage"
                 ].map((sec, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                     <span className="font-medium text-sm md:text-base text-gray-100">{sec}</span>
                   </div>
                 ))}
              </div>
            </div>
         </motion.div>
      </section>

      {/* 7. WHY THIS PROCESS WORKS */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Why This Process Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Designed by industry experts to maximize your preparation efficiency.</p>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
             {[
               { icon: Target, title: "Personalized", desc: "Resume-based interviews instead of generic questions." },
               { icon: RefreshCw, title: "Adaptive", desc: "Questions evolve based on your profile and skills." },
               { icon: Sparkles, title: "Accurate", desc: "Powered by highly contextualized Gemini AI." },
               { icon: LineChart, title: "Insightful", desc: "Detailed feedback generated after every interview." },
               { icon: Activity, title: "Trackable", desc: "Monitor your improvement over time natively." }
             ].map((item, i) => (
               <motion.div key={i} variants={fadeUp} className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow">
                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                   <item.icon className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                 <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does the AI generate interview questions?", a: "Gemini AI parses your uploaded resume, extracts your core skills and projects, and formulates relevant questions that directly test your claimed experience." },
              { q: "Can I upload multiple resumes?", a: "Yes, you can upload a new resume for each interview if you are applying for different types of roles." },
              { q: "How secure is my data?", a: "Highly secure. We use Clerk for auth and Firebase with strict security rules to ensure no one else can access your history or resume." },
              { q: "Can I retry interviews?", a: "Absolutely. You can generate unlimited interviews to continually practice and improve your scores." },
              { q: "Can I practice different job roles?", a: "Yes. Before generating the interview, you can select specific roles (e.g. Frontend, Backend, DevOps) to guide the AI." },
              { q: "How is feedback calculated?", a: "The AI evaluates your text/voice response against the expected answer, grading technical accuracy, confidence, grammar, and adherence to the STAR method." }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 py-4 text-gray-600 bg-white border-t border-gray-100">
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 max-w-6xl mx-auto px-6 w-full">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">Ready to Experience AI-Powered Preparation?</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
              Upload your resume and let PrepPilot AI build your personalized interview.
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

      {/* 10. FOOTER (Reused) */}
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
                <li><Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
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

export default HowItWorks;

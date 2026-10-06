import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, FileText,
  CheckCircle2, Code, Database, Bot,
  MessageSquare, LineChart, Sparkles,
  Upload, FileUp, Target,
  ChevronDown, ChevronUp, ShieldCheck, Globe, Mail, MessageCircle,
  SearchCode, RefreshCw, Cpu, Network, Briefcase, Mic, UserCircle, Activity, BarChart, FileSearch, Lock, ArrowDown
} from 'lucide-react';
import { Footer } from '../components/Footer';

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

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center p-4 lg:p-0">
            <div className="relative w-full h-full max-w-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 bg-gray-100">
              <img 
                src="/images/marketing/preppilot-hero-interview.jpg" 
                alt="Candidate preparing for an interview" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
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
              { num: 4, icon: Brain, title: "AI Resume Analysis", desc: "Groq AI deeply understands your background, extracting keywords, analyzing experience, and mapping you to target roles." },
              { num: 5, icon: FileSearch, title: "Generate Personalized Interview", desc: "The AI crafts a bespoke interview script matching your resume, chosen difficulty, and specific job role." },
              { num: 6, icon: Mic, title: "Take AI Mock Interview", desc: "Step into a professional interview interface featuring voice-ready support, question timers, and progress tracking." },
              { num: 7, icon: Cpu, title: "AI Evaluation", desc: "Groq AI instantly evaluates your responses for technical accuracy, communication, confidence, and STAR method usage." },
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
              <h3 className="font-bold text-gray-900 text-xl mb-3">Groq AI</h3>
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
              { icon: Sparkles, title: "Accurate", desc: "Powered by highly contextualized Groq AI." },
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
              { q: "How does the AI generate interview questions?", a: "Groq AI parses your uploaded resume, extracts your core skills and projects, and formulates relevant questions that directly test your claimed experience." },
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
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 w-full text-center">
          <div className="flex flex-col items-center justify-center space-y-4 mb-16 text-lg font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">1</span>
              Practice
            </div>
            <ArrowDown className="w-5 h-5 text-slate-300" />
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">2</span>
              Measure
            </div>
            <ArrowDown className="w-5 h-5 text-slate-300" />
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">3</span>
              Improve
            </div>
            <ArrowDown className="w-5 h-5 text-slate-300" />
            <div className="flex items-center gap-3 text-indigo-600 font-bold">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">4</span>
              Interview with confidence
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">Ready for your next interview?</h2>
          <Link to="/sign-up">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-12 h-14 text-lg font-semibold shadow-md transition-all">
              Start Practicing
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;

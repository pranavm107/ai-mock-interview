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
  ChevronDown, ChevronUp, ArrowUpRight, ShieldCheck, Globe, Mail, MessageCircle
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
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

const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full bg-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Animated Background Gradients */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] opacity-70 -z-10 mix-blend-multiply animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] opacity-70 -z-10 mix-blend-multiply"></div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-center text-center lg:items-start lg:text-left z-10"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-8 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                PrepPilot AI 2.0 is live
              </Badge>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Ace Every Interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Coaching</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Upload your resume, generate personalized technical questions, practice in real-time, and get actionable feedback. Transform anxiety into unshakeable confidence.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl w-full sm:w-auto px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  Start Free Interview <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center p-4 lg:p-0"
          >
            <div className="relative w-full max-w-[550px] h-[550px]">
              
              {/* Central AI Brain / Hub */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center z-30"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center">
                  <Brain className="w-12 h-12 text-indigo-600 animate-pulse" />
                </div>
              </motion.div>

              {/* Resume Upload Card */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-10 right-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4 z-20"
              >
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">resume.pdf</div>
                  <div className="text-xs text-gray-500">Parsing complete</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />
              </motion.div>

              {/* Chat Question Bubble */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 -left-6 bg-white rounded-2xl rounded-tl-none shadow-xl border border-gray-100 p-5 z-40 max-w-[280px]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-snug">Based on your experience at Acme Corp, how did you optimize that PostgreSQL query?</p>
                    <div className="flex gap-1 mt-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Score Card */}
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-10 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-20 flex items-center gap-4"
              >
                <div className="relative w-14 h-14 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                  <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="24" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-emerald-500" strokeDasharray="150" strokeDashoffset={150 * (1 - 0.92)} />
                  </svg>
                  <span className="text-sm font-black text-gray-900">92%</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Great Answer!</div>
                  <div className="text-xs text-gray-500 font-medium">+15 Confidence</div>
                </div>
              </motion.div>

              {/* Connection Lines (SVGs) */}
              <svg className="absolute top-0 left-0 w-full h-full -z-10 text-gray-200" style={{ strokeDasharray: "4 4" }}>
                <path d="M400 80 Q275 80 275 275" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M100 400 Q275 400 275 275" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M400 450 Q275 450 275 275" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>

            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION */}
      <section className="py-12 border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-8">Trusted by Students and Developers</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="flex text-amber-400 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <span className="font-bold text-gray-900 text-xl">4.9/5</span>
              <span className="text-sm text-gray-500">Average Rating</span>
            </div>
            <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <span className="font-black text-gray-900 text-3xl mb-1">500+</span>
              <span className="text-sm text-gray-500 font-medium">Interviews Generated</span>
            </div>
            <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <span className="font-black text-gray-900 text-3xl mb-1">50+</span>
              <span className="text-sm text-gray-500 font-medium">Job Roles Covered</span>
            </div>
            <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <span className="font-black text-emerald-600 text-3xl mb-1">95%</span>
              <span className="text-sm text-gray-500 font-medium">User Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full text-center">
        <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-10">Powered by Enterprise Grade Technology</p>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="flex flex-wrap justify-center items-center gap-4 md:gap-6"
        >
          {[
            { name: 'React', color: 'bg-sky-50 text-sky-600 border-sky-100', icon: Code, desc: 'Frontend' },
            { name: 'TypeScript', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: FileText, desc: 'Language' },
            { name: 'Clerk', color: 'bg-purple-50 text-purple-600 border-purple-100', icon: ShieldCheck, desc: 'Auth' },
            { name: 'Firebase', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Database, desc: 'Database' },
            { name: 'Gemini AI', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Brain, desc: 'Intelligence' },
            { name: 'Tailwind CSS', color: 'bg-cyan-50 text-cyan-600 border-cyan-100', icon: Layout, desc: 'Styling' },
            { name: 'Vite', color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100', icon: Zap, desc: 'Bundler' },
          ].map((tech) => (
            <motion.div key={tech.name} variants={fadeUp} className="group flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tech.color} group-hover:scale-110 transition-transform`}>
                <tech.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-sm">{tech.name}</div>
                <div className="text-xs text-gray-500 font-medium">{tech.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* WHY PREPPILOT AI? (Features) */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Supercharge Your Preparation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Everything you need to master your next technical or behavioral interview, packed into one powerful platform.</p>
          </div>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={Upload} 
              title="Resume-Based Interviews" 
              description="Our AI deeply analyzes your resume and tailors highly specific questions to your past experiences and listed skills." 
            />
            <FeatureCard 
              icon={Bot} 
              title="AI Question Generator" 
              description="Dynamic questions that adapt to your responses, simulating a real conversational interview flow with an expert." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Feedback" 
              description="Get immediate actionable insights, scoring, and suggested improvements for every answer you provide." 
            />
            <FeatureCard 
              icon={LineChart} 
              title="Performance Dashboard" 
              description="Track your progress over time, identify weak areas, and see your confidence score grow visually." 
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure Authentication" 
              description="Your data is protected with enterprise-grade security via Clerk authentication, ensuring complete privacy." 
            />
            <FeatureCard 
              icon={Cloud} 
              title="Cloud Storage" 
              description="All your interview history, resumes, and detailed feedback are securely saved and synced across devices." 
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS (Timeline) */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Four simple steps from preparation to perfection.</p>
        </div>
        
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-indigo-100 via-purple-100 to-sky-100 rounded-full">
            <motion.div 
              initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 rounded-full"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-12 md:gap-4">
            {[
              { num: 1, title: "Upload Resume", desc: "Share your PDF resume", icon: FileUp },
              { num: 2, title: "AI Analysis", desc: "Extract key skills", icon: Brain },
              { num: 3, title: "Generate Interview", desc: "Practice tailored questions", icon: MessageSquare },
              { num: 4, title: "Receive Feedback", desc: "Detailed metrics & tips", icon: Award }
            ].map((step, i) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center flex-1 group"
              >
                <div className="w-24 h-24 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 relative group-hover:border-indigo-100 transition-colors shadow-sm">
                  <div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8" />
                  </div>
                  {/* Connecting Line (Mobile) */}
                  {i !== 3 && <div className="md:hidden absolute top-24 w-1 h-12 bg-indigo-100"></div>}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-gray-600 font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Targeted Practice</h2>
              <p className="text-gray-600 max-w-2xl text-lg">Practice for exactly the role you are targeting with domain-specific AI models.</p>
            </div>
            <Button variant="outline" className="rounded-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">View All Categories</Button>
          </div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { name: 'Software Engineering', icon: Code, q: '450+ Questions' },
              { name: 'Data Science', icon: Database, q: '320+ Questions' },
              { name: 'AI / Machine Learning', icon: Brain, q: '280+ Questions' },
              { name: 'Full Stack Web', icon: Layout, q: '510+ Questions' },
              { name: 'Frontend', icon: MonitorSmartphone, q: '390+ Questions' },
              { name: 'Backend', icon: Server, q: '410+ Questions' },
              { name: 'DevOps / Cloud', icon: Cloud, q: '250+ Questions' },
              { name: 'Behavioral', icon: Users, q: '150+ Questions' },
            ].map((cat) => (
              <motion.div key={cat.name} variants={fadeUp} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <cat.icon className="w-8 h-8 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">{cat.q}</p>
                  <div className="mt-auto flex justify-between items-center w-full">
                    <span className="text-indigo-600 font-semibold text-sm">Practice Now</span>
                    <ArrowUpRight className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI FEEDBACK (Dashboard Preview) */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Deep Dive into Your Performance</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our AI doesn't just tell you if you were right or wrong. It evaluates your technical accuracy, communication style, problem-solving approach, and overall confidence with radar-like precision.
            </motion.p>
            <motion.ul variants={staggerContainer} className="space-y-4">
              {[
                "Granular metrics across 5 key dimensions",
                "Actionable suggestions to improve STAR responses",
                "Historical progress tracking and leaderboards",
                "Video replay with timestamped AI notes"
              ].map((suggestion, i) => (
                <motion.li key={i} variants={fadeUp} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-gray-800 font-medium text-lg">{suggestion}</span>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp} className="mt-10">
              <Button variant="outline" className="rounded-full px-8 h-12 border-gray-300">View Sample Report</Button>
            </motion.div>
          </motion.div>
          
          {/* Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative group"
          >
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity -z-10"></div>
            
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-bold text-gray-900">Recent Interview</h3>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1">
                Completed
              </Badge>
            </div>
            
            <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
              <div className="relative h-40 w-40 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="72" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 452 }}
                    whileInView={{ strokeDashoffset: 452 * (1 - 0.92) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    cx="80" cy="80" r="72" fill="transparent" stroke="url(#gradient)" strokeWidth="12" 
                    strokeDasharray="452" 
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black text-gray-900">92<span className="text-xl">%</span></div>
                  <div className="text-sm font-semibold text-gray-500">Overall Score</div>
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-5">
                {[
                  { label: "Technical Knowledge", score: 95, color: "bg-indigo-600" },
                  { label: "Communication", score: 88, color: "bg-purple-500" },
                  { label: "Problem Solving", score: 91, color: "bg-emerald-500" },
                  { label: "Confidence", score: 89, color: "bg-sky-500" },
                ].map((metric, idx) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-700">{metric.label}</span>
                      <span className="text-gray-900 font-bold">{metric.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: `${metric.score}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                        className={`${metric.color} h-full rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> AI Action Items
              </h4>
              <div className="space-y-2">
                <div className="flex gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-emerald-500 font-bold">↑</span> Try to use the STAR method more strictly in behavioral answers.
                </div>
                <div className="flex gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-emerald-500 font-bold">↑</span> Great explanation of React hooks, but mention useMemo next time.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { num: "500+", label: "Interview Questions", icon: FileText },
              { num: "50+", label: "Job Roles", icon: Users },
              { num: "10+", label: "Categories", icon: Target },
              { num: "100%", label: "AI Generated", icon: Brain },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-indigo-200">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{stat.num}</div>
                <div className="text-indigo-200 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (New) */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Don't Just Take Our Word For It</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">See what other candidates are saying about PrepPilot AI.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "This AI helped me prepare for my Amazon interview. The system design questions were incredibly accurate to the real thing.", name: "Sarah J.", role: "Software Engineer", company: "Amazon" },
              { quote: "Great resume-based questions. It literally extracted a project I did 3 years ago and grilled me on it. So glad I practiced!", name: "Michael T.", role: "Recent Graduate", company: "Student" },
              { quote: "The feedback is brutal but necessary. It pointed out my filler words and helped me structure my answers much better.", name: "David L.", role: "Product Manager", company: "Fintech Startup" }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative">
                <div className="flex text-amber-400 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
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

      {/* COMPANIES SECTION (New) */}
      <section className="py-16 bg-white text-center">
        <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-8">Questions inspired by interviews from</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple'].map(company => (
            <div key={company} className="text-2xl font-black text-gray-800 tracking-tighter">
              {company}
            </div>
          ))}
        </div>
      </section>

      {/* ADVANTAGES (Premium 2x3 Grid) */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">The PrepPilot Advantage</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Built for ambitious professionals aiming for top-tier companies.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Personalized Experience", desc: "Every interview is unique, tailored to your exact background and target role.", icon: Users },
              { title: "Real-Time AI Evaluation", desc: "Get instant scores and granular feedback the moment you finish answering.", icon: Bot },
              { title: "Industry Ready", desc: "Questions sourced from top tech companies to prepare you for real scenarios.", icon: Layout },
              { title: "Enterprise Security", desc: "Enterprise-level security for your personal data and resume uploads.", icon: Lock },
              { title: "Infinite Scalability", desc: "Practice as much as you want. Our AI scales to meet your preparation needs.", icon: LineChart },
              { title: "Lightning Fast", desc: "Generate a complete tailored interview in seconds, not hours.", icon: Zap },
            ].map((feature, i) => (
              <motion.div 
                key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-shadow group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.desc}</p>
                <div className="text-indigo-600 font-semibold text-sm flex items-center">
                  Explore Feature <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (New) */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "Can I upload my resume?", a: "Yes! Our platform parses your PDF resume and generates custom interview questions directly related to your past experience and listed skills." },
              { q: "How are questions generated?", a: "We use Google's Gemini AI, trained on thousands of real interview questions from top tech companies, to dynamically generate relevant scenarios." },
              { q: "Can I practice multiple interviews?", a: "Absolutely. You can generate unlimited mock interviews across various categories to perfect your skills." },
              { q: "Does AI provide feedback?", a: "Yes, you receive instant, highly detailed feedback on technical accuracy, communication, and confidence immediately after finishing." }
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
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 py-4 text-gray-600 bg-gray-50"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 max-w-6xl mx-auto px-6 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Floating blur shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">Ready to Land Your Dream Job?</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of candidates who cracked their dream company interviews using PrepPilot AI.
            </p>
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-50 rounded-full px-10 h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                Start Your Mock Interview For Free
              </Button>
            </Link>
            <p className="text-indigo-200 mt-6 text-sm">No credit card required. Setup takes 30 seconds.</p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
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
                <li><Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</Link></li>
                <li><Link to="/testimonials" className="hover:text-indigo-400 transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 tracking-wide text-sm">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
                <li><Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
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
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

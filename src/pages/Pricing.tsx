import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Sparkles, Star, ChevronDown, ChevronUp, Lock, Zap, 
  FileText, Globe, Brain, MessageSquare, Rocket, HelpCircle, 
  Database, LineChart, Code, Mail, Cloud
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Pricing: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col w-full bg-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 overflow-hidden px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] opacity-70 -z-10 animate-pulse"></div>
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] opacity-70 -z-10"></div>
        
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10 flex flex-col items-center">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-8 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              🎉 Limited Time Launch Offer
            </Badge>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pricing</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
            Choose the perfect plan for your interview preparation journey. Start today with our exclusive launch offer.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Link to="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Start Free
              </Button>
            </Link>
            <a href="#compare">
              <Button size="lg" variant="outline" className="rounded-xl px-8 h-14 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                Compare Plans
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. LAUNCH OFFER BANNER */}
      <section className="px-6 w-full max-w-5xl mx-auto mb-16 relative z-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-10 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden border border-indigo-400">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[50px]"></div>
          
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <Rocket className="w-8 h-8 text-amber-300 animate-bounce" />
              <h2 className="text-3xl font-bold tracking-tight">Launch Offer</h2>
            </div>
            <p className="text-indigo-100 text-lg mb-4">All new users get full Pro access absolutely <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">FREE</span> for a limited time.</p>
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="bg-white/20 px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase">Offer Ends Soon</span>
            </div>
          </div>

          <div className="relative z-10 bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center min-w-[250px] text-gray-900 text-center transform hover:scale-105 transition-transform">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none mb-4 absolute -top-3 shadow-sm px-4 py-1 text-xs uppercase font-black">100% OFF</Badge>
            <div className="text-gray-400 font-semibold line-through decoration-red-500 decoration-2 text-lg mb-1">₹999/month</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 mb-6">₹0<span className="text-lg text-gray-500 font-medium">/mo</span></div>
            <Link to="/sign-up" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-bold shadow-md hover:shadow-lg transition-all">Claim Free Access</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 3. PRICING CARDS */}
      <section className="pb-24 px-6 w-full max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          
          {/* FREE PLAN */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex">
            <Card className="w-full rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden bg-white">
              <CardContent className="p-10 flex flex-col flex-1">
                <Badge variant="outline" className="w-max mb-6 text-gray-500 border-gray-200 rounded-full">Perfect for Beginners</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-black text-gray-900 mb-6">₹0</div>
                <p className="text-gray-500 text-sm mb-8 pb-8 border-b border-gray-100">The basics to get you started with AI interview preparation.</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">3 AI Interviews per month</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Resume Upload</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Basic AI Feedback</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Interview History</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Email Support</span></li>
                </ul>
                <Link to="/sign-up">
                   <Button variant="outline" className="w-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl py-6 font-bold text-base transition-colors mt-auto">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* PRO PLAN */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex md:-mt-8 md:mb-8 z-20">
            <Card className="w-full rounded-[2.5rem] border-2 border-indigo-500 shadow-2xl flex flex-col relative overflow-hidden bg-white group">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="absolute top-0 right-0 p-4 w-full flex justify-end">
                 <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none shadow-sm px-4 py-1.5 uppercase font-bold text-xs tracking-wider">Most Popular</Badge>
              </div>
              <CardContent className="p-10 flex flex-col flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none w-max mb-6 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Launch Offer
                  </Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">₹0<span className="text-lg text-gray-500 font-medium">/mo</span></div>
                    <div className="text-gray-400 font-semibold line-through decoration-red-500 decoration-2">₹999</div>
                  </div>
                  <p className="text-gray-600 text-sm mb-8 pb-8 border-b border-indigo-100">Everything you need to master interviews and land top jobs.</p>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-900 font-bold">Unlimited AI Interviews</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-900 font-bold">Unlimited Resume Uploads</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">Advanced AI Feedback</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">Behavioral & Technical</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">Coding Interviews</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">Performance Analytics</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">Gemini AI Powered</span></li>
                    <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" /><span className="text-gray-700 font-medium">Priority Support</span></li>
                  </ul>
                  <Link to="/sign-up">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-6 font-bold text-base shadow-xl hover:shadow-2xl transition-all group-hover:scale-[1.02] mt-auto">Claim Free Pro</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ENTERPRISE PLAN */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex">
            <Card className="w-full rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden bg-white">
              <CardContent className="p-10 flex flex-col flex-1">
                <Badge variant="outline" className="w-max mb-6 text-gray-500 border-gray-200 rounded-full">For Companies</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-black text-gray-900 mb-6">₹4,999<span className="text-lg text-gray-500 font-medium">/mo</span></div>
                <p className="text-gray-500 text-sm mb-8 pb-8 border-b border-gray-100">Dedicated solutions for recruitment agencies and large teams.</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" /><span className="text-gray-900 font-bold">Everything in Pro</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Team Dashboard</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Bulk User Management</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Recruiter Analytics</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Company Branding</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">Dedicated Support</span></li>
                  <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" /><span className="text-gray-600 font-medium">API Access</span></li>
                </ul>
                <Link to="/contact">
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-6 font-bold text-base transition-colors mt-auto">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURE COMPARISON TABLE */}
      <section id="compare" className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Compare Plans</h2>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-6 font-bold text-gray-900 w-1/3">Features</th>
                  <th className="p-6 font-bold text-gray-600 text-center w-1/5">Free</th>
                  <th className="p-6 font-bold text-indigo-700 text-center w-1/5 bg-indigo-50/50 border-x border-indigo-100">Pro</th>
                  <th className="p-6 font-bold text-gray-600 text-center w-1/5">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Monthly Interviews", free: "3", pro: "Unlimited", ent: "Unlimited" },
                  { feature: "Resume Upload", free: "Basic", pro: "Unlimited", ent: "Unlimited" },
                  { feature: "AI Feedback", free: "Basic", pro: "Advanced", ent: "Advanced" },
                  { feature: "Behavioral Questions", free: true, pro: true, ent: true },
                  { feature: "Technical Questions", free: false, pro: true, ent: true },
                  { feature: "Coding Questions", free: false, pro: true, ent: true },
                  { feature: "Interview History", free: "30 Days", pro: "Lifetime", ent: "Lifetime" },
                  { feature: "Analytics Dashboard", free: false, pro: true, ent: true },
                  { feature: "Cloud Storage", free: false, pro: true, ent: true },
                  { feature: "Priority Support", free: false, pro: true, ent: true },
                  { feature: "Team Dashboard", free: false, pro: false, ent: true },
                  { feature: "API Access", free: false, pro: false, ent: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 px-6 font-medium text-gray-700">{row.feature}</td>
                    <td className="p-4 px-6 text-center text-gray-500">
                      {typeof row.free === 'boolean' ? (row.free ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : row.free}
                    </td>
                    <td className="p-4 px-6 text-center font-bold text-indigo-700 bg-indigo-50/30 border-x border-indigo-50">
                      {typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-5 h-5 text-indigo-600 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : row.pro}
                    </td>
                    <td className="p-4 px-6 text-center text-gray-500">
                      {typeof row.ent === 'boolean' ? (row.ent ? <Check className="w-5 h-5 text-gray-900 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : row.ent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE PRO? */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Why Choose Pro?</h2>
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, title: "Unlimited AI Interviews", color: "text-indigo-600", bg: "bg-indigo-100" },
            { icon: FileText, title: "Personalized Resume Analysis", color: "text-purple-600", bg: "bg-purple-100" },
            { icon: Brain, title: "Advanced AI Evaluation", color: "text-emerald-600", bg: "bg-emerald-100" },
            { icon: Code, title: "Coding Interview Simulation", color: "text-sky-600", bg: "bg-sky-100" },
            { icon: MessageSquare, title: "Behavioral Interview Practice", color: "text-amber-600", bg: "bg-amber-100" },
            { icon: LineChart, title: "Performance Analytics", color: "text-pink-600", bg: "bg-pink-100" },
            { icon: Cloud, title: "Cloud Sync", color: "text-blue-600", bg: "bg-blue-100" },
            { icon: HelpCircle, title: "Priority Support", color: "text-teal-600", bg: "bg-teal-100" }
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 ${item.bg} rounded-full flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 6. SAVINGS SECTION */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 w-full relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight">How Much Are You Saving?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
               <div className="text-indigo-200 font-medium mb-2 uppercase tracking-wider text-sm">Normal Annual Cost</div>
               <div className="text-4xl font-black mb-1 line-through decoration-red-400 decoration-4">₹11,988</div>
               <div className="text-sm text-gray-300">based on ₹999/month</div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 p-8 rounded-3xl border border-emerald-300 shadow-2xl transform md:scale-110">
               <div className="text-emerald-50 font-bold mb-2 uppercase tracking-wider text-sm flex justify-center items-center gap-2">
                 <Badge className="bg-white text-emerald-600 border-none">100% OFF TODAY</Badge>
               </div>
               <div className="text-indigo-950 font-black mb-1 text-sm uppercase tracking-wider">You Pay</div>
               <div className="text-6xl font-black text-white mb-2">₹0</div>
               <div className="text-sm font-bold text-emerald-950 bg-emerald-300/50 rounded-full py-1 px-3 w-max mx-auto">You Save ₹11,988</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Lock, title: "Secure Payments" },
            { icon: Zap, title: "Instant Activation" },
            { icon: FileText, title: "No Hidden Charges" },
            { icon: Globe, title: "Built for Indian Devs" },
            { icon: Brain, title: "Powered by Gemini AI" },
            { icon: Database, title: "Firebase Cloud Storage" }
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <t.icon className="w-8 h-8 text-gray-400 mb-3" />
              <div className="text-xs font-bold text-gray-600">{t.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "The Pro version helped me crack my software engineering interview. Totally worth the full price, but free is insane.", name: "Rahul K.", role: "SDE II" },
              { quote: "The personalized AI feedback is incredibly accurate. Better than actual human mocks I've paid for.", name: "Sneha P.", role: "Frontend Dev" },
              { quote: "The launch offer is amazing. Zero friction, instant access, and the product works flawlessly.", name: "Arjun M.", role: "Data Scientist" }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex text-amber-400 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-700 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-auto">
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

      {/* 7. FAQ SECTION */}
      <section className="py-24 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is the launch offer really free?", a: "Yes! All users who sign up during the launch period get 100% free access to the Pro plan." },
              { q: "Will I be charged automatically?", a: "No. We do not require a credit card to claim the free launch offer. You will not be charged." },
              { q: "Can I upgrade later?", a: "If you are on the Free plan, you can upgrade to Pro at any time. If you claim the launch offer, you already have Pro!" },
              { q: "Can I cancel anytime?", a: "Yes, there are no lock-in contracts. You can delete your account and data at any time from the dashboard." },
              { q: "Which payment methods are supported?", a: "For paid plans, we support UPI, Credit/Debit cards, Net Banking, and Wallets securely via Stripe." },
              { q: "Is GST included?", a: "Yes, all our prices (when applicable) are inclusive of GST for Indian customers." },
              { q: "Can companies purchase Enterprise?", a: "Yes, companies can contact our sales team to arrange customized Enterprise plans for bulk users." }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
                <button 
                  className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors text-left"
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

      {/* 10. FINAL CTA */}
      <section className="py-24 max-w-6xl mx-auto px-6 w-full">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">Start Preparing Smarter Today</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
              Claim your FREE Pro access before the launch offer ends.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-50 rounded-xl px-10 h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  Claim Free Pro
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="border-indigo-300 text-white bg-transparent hover:bg-white/10 rounded-xl px-10 h-16 text-lg font-bold transition-all">
                  View Features
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 11. FOOTER (Reused) */}
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
                  <MessageSquare className="w-5 h-5" />
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

export default Pricing;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Mail, Briefcase, Wrench, MapPin, Clock, Phone, 
  Globe, Code, Video, MessageCircle, CheckCircle2, 
  Lock, Zap, ShieldCheck, ChevronDown, ChevronUp, Copy, Check,
  Send, Sparkles, Brain, Paperclip, Loader2, Handshake, Bug, Lightbulb, CreditCard, UserCog, Star, HelpCircle
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setFormStatus('success');
      setMessage('');
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full bg-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden px-6 lg:px-8 max-w-7xl mx-auto w-full text-center lg:text-left">
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] opacity-70 -z-10 animate-pulse"></div>
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] opacity-70 -z-10"></div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10 flex flex-col items-center lg:items-start">
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-8 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
                💬 We'd Love to Hear From You
              </Badge>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Get in Touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">PrepPilot AI</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed text-center lg:text-left">
              Whether you have questions, feedback, partnership opportunities, or need support, our team is here to help.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="#contact-form" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Contact Support
                </Button>
              </a>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl px-8 h-14 text-lg font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
                  View Documentation
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative h-[500px] w-full hidden lg:flex items-center justify-center perspective-1000">
            <div className="relative w-full max-w-md h-full flex items-center justify-center">
              
              {/* Central Element */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute z-20 w-32 h-32 bg-white rounded-3xl shadow-2xl border border-gray-100 flex items-center justify-center">
                 <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center">
                   <MessageSquare className="w-12 h-12 text-indigo-600 animate-pulse" />
                 </div>
              </motion.div>

              {/* Orbiting Cards */}
              <motion.div animate={{ y: [0, 15, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-1/4 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-30">
                <div className="bg-emerald-100 p-2 rounded-lg"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
                <div><div className="text-sm font-bold">Support Ticket</div><div className="text-xs text-gray-500">Resolved</div></div>
              </motion.div>
              
              <motion.div animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }} className="absolute bottom-1/4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-30">
                <div className="bg-sky-100 p-2 rounded-lg"><Clock className="w-6 h-6 text-sky-600" /></div>
                <div><div className="text-sm font-bold">Response Time</div><div className="text-xs text-gray-500">&lt; 24 Hours</div></div>
              </motion.div>

              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} className="absolute top-1/3 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                <div className="bg-purple-100 p-2 rounded-lg"><Mail className="w-6 h-6 text-purple-600" /></div>
                <div><div className="text-sm font-bold">Email Notification</div></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CONTACT OPTIONS */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            
            {/* Email Support */}
            <motion.div variants={fadeUp}>
              <Card className="h-full border border-gray-200 shadow-sm rounded-[2rem] hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Support</h3>
                  <div className="text-indigo-600 font-medium mb-4 flex items-center gap-2">
                    pranavagneeshm@gmail.com
                    <button onClick={() => handleCopyEmail('pranavagneeshm@gmail.com')} className="p-1 hover:bg-indigo-50 rounded-md transition-colors" title="Copy Email">
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-6 flex-1">General support, technical issues, and product inquiries.</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <Clock className="w-4 h-4 text-indigo-400" /> Response: Within 24 Hours
                  </div>
                  <a href="mailto:pranavagneeshm@gmail.com">
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl py-6 font-bold transition-colors">Send Email</Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Inquiries */}
            <motion.div variants={fadeUp}>
              <Card className="h-full border border-gray-200 shadow-sm rounded-[2rem] hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Business Inquiries</h3>
                  <div className="text-purple-600 font-medium mb-4">business@preppilot.ai</div>
                  <p className="text-gray-600 text-sm mb-6 flex-1">Partnerships, enterprise solutions, and collaborations.</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <Clock className="w-4 h-4 text-purple-400" /> Response: 1-2 Business Days
                  </div>
                  <a href="mailto:pranavagneeshm@gmail.com?subject=Business%20Inquiry">
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl py-6 font-bold transition-colors">Contact Business Team</Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Technical Support */}
            <motion.div variants={fadeUp}>
              <Card className="h-full border border-gray-200 shadow-sm rounded-[2rem] hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Wrench className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Support</h3>
                  <div className="text-emerald-600 font-medium mb-4">help@preppilot.ai</div>
                  <p className="text-gray-600 text-sm mb-6 flex-1">Troubleshooting, bug reports, and account assistance.</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <Zap className="w-4 h-4 text-emerald-400" /> Response: Priority Support
                  </div>
                  <a href="#contact-form">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-6 font-bold shadow-md transition-all">Open Support Ticket</Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 3. CONTACT FORM & 4. OFFICE INFO */}
      <section id="contact-form" className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* Office Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Visit Us</h2>
              <p className="text-gray-600">Reach out directly or stop by our office. We're always open to meeting new talent and partners.</p>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Headquarters</h4>
                <p className="text-gray-600 text-sm">Coimbatore<br/>Tamil Nadu, India</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Working Hours</h4>
                <p className="text-gray-600 text-sm">Monday to Friday<br/>9:00 AM – 6:00 PM IST</p>
              </div>
            </div>

            <a href="tel:+919999999999" className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                <p className="text-gray-600 text-sm">+91-XXXXXXXXXX</p>
              </div>
            </a>

            <a href="https://www.linkedin.com/in/pranav-agneesh" target="_blank" rel="noreferrer" className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Website</h4>
                <p className="text-gray-600 text-sm hover:text-indigo-600 transition-colors">www.linkedin.com/in/pranav-agneesh</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden relative bg-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full pointer-events-none"></div>
              <CardContent className="p-8 md:p-12 relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h3>
                
                {formStatus === 'success' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-16">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                      <Check className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                    <p className="text-gray-600">Thank you for reaching out. Our team will get back to you shortly.</p>
                    <Button onClick={() => setFormStatus('idle')} variant="outline" className="mt-8 rounded-full px-8">Send Another Message</Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <input required type="text" placeholder="John Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input required type="email" placeholder="john@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Subject</label>
                        <input required type="text" placeholder="How can we help?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <div className="relative">
                          <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-700">
                            <option value="">Select a category</option>
                            <option value="general">General Inquiry</option>
                            <option value="technical">Technical Support</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="business">Business Partnership</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-semibold text-gray-700">Message</label>
                        <span className="text-xs text-gray-400">{message.length}/500</span>
                      </div>
                      <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={500}
                        rows={5} 
                        placeholder="Please describe your issue or inquiry in detail..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none" 
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <button type="button" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-4 py-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 w-full sm:w-auto justify-center">
                        <Paperclip className="w-4 h-4" /> Attach File (Optional)
                      </button>
                      
                      <Button 
                        type="submit" 
                        disabled={formStatus === 'loading'}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-10 h-12 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {formStatus === 'loading' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" /> Send Message</>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. WHY CONTACT US? */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
         <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Why Contact Us?</h2>
            </div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Fast Response", desc: "Average reply within 24 hours.", icon: Zap, bg: "bg-amber-100", col: "text-amber-600" },
                { title: "Expert Support", desc: "Our AI and technical team are here to help.", icon: Brain, bg: "bg-purple-100", col: "text-purple-600" },
                { title: "Customer First", desc: "We value every suggestion and feedback.", icon: Star, bg: "bg-emerald-100", col: "text-emerald-600" },
                { title: "Enterprise Ready", desc: "Dedicated support for business customers.", icon: ShieldCheck, bg: "bg-sky-100", col: "text-sky-600" }
              ].map((c, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <c.icon className={`w-7 h-7 ${c.col}`} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{c.title}</h4>
                  <p className="text-gray-600 text-sm">{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>
         </div>
      </section>

      {/* 6. SUPPORT CATEGORIES */}
      <section className="py-24 max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Support Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Technical Issues", icon: Wrench },
            { label: "Account Help", icon: UserCog },
            { label: "Billing", icon: CreditCard },
            { label: "Feature Requests", icon: Lightbulb },
            { label: "Bug Reports", icon: Bug },
            { label: "Partnership", icon: Handshake },
            { label: "Recruiter Solutions", icon: Briefcase },
            { label: "General Questions", icon: HelpCircle }
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
              <cat.icon className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 mb-3 transition-colors" />
              <div className="text-sm font-semibold text-gray-700 group-hover:text-indigo-900 text-center">{cat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. COMMUNITY SECTION */}
      <section className="py-24 bg-gray-900 text-white border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Join the Community</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Connect with other developers, share interview tips, and stay updated.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "GitHub", desc: "View source code and contribute.", icon: Code, col: "hover:border-gray-500", link: "https://github.com/pranavm107" },
              { title: "LinkedIn", desc: "Follow product updates.", icon: Briefcase, col: "hover:border-blue-500", link: "https://www.linkedin.com/in/pranav-agneesh" },
              { title: "Discord", desc: "Join discussions and ask questions.", icon: MessageCircle, col: "hover:border-indigo-500", link: "#" },
              { title: "YouTube", desc: "Watch tutorials and walkthroughs.", icon: Video, col: "hover:border-red-500", link: "#" }
            ].map((soc, i) => (
              <a key={i} href={soc.link} target="_blank" rel="noreferrer" className={`bg-gray-800 p-8 rounded-2xl border border-gray-700 transition-all ${soc.col} group block`}>
                <soc.icon className="w-8 h-8 text-gray-400 group-hover:text-white mb-6 transition-colors" />
                <h4 className="font-bold text-white text-lg mb-2">{soc.title}</h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{soc.desc}</p>
              </a>
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
              { q: "How quickly will I receive a reply?", a: "Our average response time for general inquiries is within 24 hours. Technical support and enterprise customers receive priority handling." },
              { q: "Can I report a bug?", a: "Yes! Please use the contact form above and select 'Bug Report' from the category dropdown. Including screenshots or logs will help us fix it faster." },
              { q: "Do you offer enterprise support?", a: "Yes, we provide dedicated support channels and account managers for our enterprise clients. Select 'Business Partnership' to learn more." },
              { q: "Can I request a new feature?", a: "Absolutely. We build PrepPilot AI based on community feedback. Submit a 'Feature Request' through our contact form." },
              { q: "How do I delete my account?", a: "You can delete your account directly from your dashboard settings. If you need assistance, contact Technical Support." },
              { q: "Where can I view documentation?", a: "Our comprehensive documentation is available in the 'How It Works' section, or by clicking 'View Documentation' at the top of this page." }
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

      {/* 9. TRUST SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Lock, title: "Secure Communication" },
            { icon: Zap, title: "Fast Response" },
            { icon: MessageCircle, title: "Friendly Support" },
            { icon: Globe, title: "Global Accessibility" }
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <t.icon className="w-8 h-8 text-indigo-400 mb-4" />
              <div className="font-bold text-gray-900">{t.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 max-w-6xl mx-auto px-6 w-full">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">Let's Build Better Interview Experiences Together</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
              We're always excited to hear from developers, students, recruiters, and organizations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="#contact-form">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-50 rounded-xl px-10 h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                  Send a Message
                </Button>
              </a>
              <Link to="/features">
                <Button size="lg" variant="outline" className="border-indigo-300 text-white bg-transparent hover:bg-white/10 rounded-xl px-10 h-16 text-lg font-bold transition-all">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 11. FOOTER */}
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
                <a href="https://github.com/pranavm107" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Code className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/pranav-agneesh" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                </a>
                <a href="mailto:pranavagneeshm@gmail.com" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
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

export default Contact;

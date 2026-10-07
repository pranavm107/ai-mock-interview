import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/dashboard/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { FileText, Target, CheckCircle2, XCircle, ChevronRight, BarChart, MessageSquare, Briefcase, Zap, ShieldAlert, CheckSquare, ArrowRight } from 'lucide-react';
import { Footer } from '../components/Footer';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const SampleReport: React.FC = () => {
  return (
    <div className="flex flex-col w-full bg-slate-50 font-sans">
      
      {/* HEADER SECTION */}
      <section className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 mb-4 font-bold text-xs uppercase tracking-widest">
              Sample Report
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Technical Interview Report</h1>
            <div className="text-gray-500 font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Software Engineer • Full Stack
            </div>
            <div className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              Candidate: Sample User
            </div>
          </div>
          
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90 drop-shadow-md">
              <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
              <circle
                cx="64" cy="64" r="56" fill="transparent" stroke="#4f46e5" strokeWidth="12"
                strokeDasharray="351"
                strokeDashoffset={351 - (351 * 87) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-black text-gray-900">87<span className="text-lg">%</span></div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 w-full space-y-12">
        
        {/* METRICS & RADAR */}
        <motion.section initial="hidden" animate="visible" variants={staggerContainer} className="grid md:grid-cols-2 gap-8">
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-indigo-500" /> Category Performance
            </h3>
            <div className="space-y-6">
              {[
                { label: "Technical Knowledge", score: 91, color: "bg-indigo-600" },
                { label: "Behavioral", score: 89, color: "bg-purple-600" },
                { label: "Problem Solving", score: 88, color: "bg-emerald-500" },
                { label: "Communication", score: 84, color: "bg-sky-500" },
                { label: "Confidence", score: 82, color: "bg-amber-500" },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">{metric.label}</span>
                    <span className="text-gray-900 font-bold">{metric.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${metric.color} h-full rounded-full`} style={{ width: `${metric.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-8">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Key Strengths
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-emerald-700 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" /> Strong technical fundamentals, particularly in React and state management.
                </li>
                <li className="flex items-start gap-2 text-emerald-700 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" /> Clear and logical problem-solving structure.
                </li>
                <li className="flex items-start gap-2 text-emerald-700 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" /> Good use of concrete examples in behavioral responses.
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" /> Areas for Improvement
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-amber-700 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" /> Reduce filler words ("um", "like") during transitions.
                </li>
                <li className="flex items-start gap-2 text-amber-700 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" /> Strengthen depth on system design trade-offs (e.g. SQL vs NoSQL).
                </li>
                <li className="flex items-start gap-2 text-amber-700 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" /> Apply a stricter STAR format to behavioral answers to ensure impactful results.
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.section>

        {/* DETAILED QUESTION BREAKDOWN */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" /> Question Breakdown
          </h2>
          <div className="space-y-6">
            
            {/* Question 1 */}
            <Card className="border-gray-200 shadow-sm overflow-hidden rounded-2xl">
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2 bg-white">Technical</Badge>
                  <h4 className="font-bold text-gray-900 text-lg">Can you explain how React's Virtual DOM works and why it's beneficial?</h4>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-500">Score</span>
                  <span className="text-lg font-bold text-indigo-600">95/100</span>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Candidate Response Summary</div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The candidate correctly identified that the Virtual DOM is a lightweight JavaScript representation of the actual DOM. They explained the diffing algorithm (reconciliation) and how React batches updates to minimize expensive real DOM mutations, resulting in better performance.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-emerald-800 font-bold text-sm mb-2 flex items-center gap-1.5"><CheckSquare className="w-4 h-4" /> What Went Well</div>
                    <p className="text-emerald-700 text-xs leading-relaxed font-medium">Excellent technical accuracy. Mentioned "reconciliation" explicitly and clearly explained the performance benefits of batching.</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="text-indigo-800 font-bold text-sm mb-2 flex items-center gap-1.5"><Target className="w-4 h-4" /> How to Improve</div>
                    <p className="text-indigo-700 text-xs leading-relaxed font-medium">To achieve a perfect score, briefly mention how React uses the `key` prop in lists during the diffing process to maintain optimal performance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question 2 */}
            <Card className="border-gray-200 shadow-sm overflow-hidden rounded-2xl">
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2 bg-white text-purple-600 border-purple-200">Behavioral</Badge>
                  <h4 className="font-bold text-gray-900 text-lg">Tell me about a time you had a disagreement with a team member on a technical decision.</h4>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-500">Score</span>
                  <span className="text-lg font-bold text-amber-500">78/100</span>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Candidate Response Summary</div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The candidate described a situation where they disagreed on whether to use Redux or React Context. They explained the argument and mentioned they eventually compromised on Context due to team familiarity.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-emerald-800 font-bold text-sm mb-2 flex items-center gap-1.5"><CheckSquare className="w-4 h-4" /> What Went Well</div>
                    <p className="text-emerald-700 text-xs leading-relaxed font-medium">Chose a highly relevant technical disagreement. Demonstrated a willingness to compromise and prioritize the team's velocity over personal preference.</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-1.5"><Target className="w-4 h-4" /> How to Improve</div>
                    <p className="text-amber-700 text-xs leading-relaxed font-medium">The answer lacked a clear structure. Use the STAR method (Situation, Task, Action, Result). You missed the "Result" — what was the business outcome of choosing React Context?</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* ACTION PLAN */}
        <section className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-40"></div>
          <h2 className="text-2xl font-bold mb-6 relative z-10 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" /> Recommended Action Plan
          </h2>
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-indigo-800/50 p-6 rounded-2xl border border-indigo-700">
              <h4 className="font-bold text-indigo-200 mb-3 text-sm uppercase tracking-wider">Targeted Practice</h4>
              <p className="text-white text-sm leading-relaxed mb-4">Focus on the <strong>System Design</strong> category. Run 3 mock interviews prioritizing database scaling questions.</p>
              <div className="text-indigo-300 font-medium text-xs flex items-center group cursor-pointer">
                Practice System Design <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="bg-indigo-800/50 p-6 rounded-2xl border border-indigo-700">
              <h4 className="font-bold text-indigo-200 mb-3 text-sm uppercase tracking-wider">Communication Skill</h4>
              <p className="text-white text-sm leading-relaxed mb-4">Run 2 <strong>Behavioral</strong> interviews and force yourself to speak the acronym "S.T.A.R" internally before answering.</p>
              <div className="text-indigo-300 font-medium text-xs flex items-center group cursor-pointer">
                Practice Behavioral <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-12 border-t border-gray-200 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to see your own report?</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Stop guessing how you perform in interviews. Get actionable, granular feedback tailored to your exact skills and experience.
          </p>
          <Link to="/sign-up">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-14 text-lg font-semibold shadow-lg hover:-translate-y-1 transition-all">
              Start Your Free Interview <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>

      </div>
      
      <Footer />
    </div>
  );
};

export default SampleReport;

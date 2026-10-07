import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, Lightbulb, TrendingUp, ArrowRight, 
  MessageSquare, CheckCircle2, UserCircle, RefreshCw,
  GraduationCap, Briefcase, Award 
} from 'lucide-react';
import { Footer } from '../components/Footer';

export default function About() {
  useEffect(() => {
    document.title = 'About PrepPilot AI | Smarter Interview Preparation';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Learn how PrepPilot AI helps candidates practice realistic interviews, understand their weaknesses, and prepare with purpose.');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-indigo-100">
      <div className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <section className="pt-24 pb-20 lg:pt-32 lg:pb-28 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div>
              <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-4">
                About PrepPilot AI
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                Helping candidates prepare with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">purpose.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mb-8">
                PrepPilot AI helps candidates practice realistic interviews, understand where they need to improve, and turn every practice session into meaningful progress.
              </p>
            </div>
            {/* Minimal AI Visual */}
            <div className="relative w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-square rounded-[3rem] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8 border border-white shadow-[inset_0_0_40px_rgba(255,255,255,1)]">
                {/* Abstract visualization of AI conversation nodes */}
                <div className="absolute inset-0 overflow-hidden rounded-[3rem]">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-200/40 rounded-full blur-3xl mix-blend-multiply"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply"></div>
                </div>
                <div className="relative z-10 w-full max-w-sm">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transform -rotate-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="h-4 bg-gray-100 rounded w-3/4 mt-2"></div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 ml-8 transform rotate-1">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="space-y-2 w-full mt-2">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. OUR MISSION */}
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 tracking-tight">
              Interview preparation should be <br className="hidden md:block"/> intentional, not repetitive.
            </h2>
            <div className="text-lg md:text-xl text-gray-600 leading-relaxed space-y-6">
              <p>
                Preparing for an interview is more than answering a list of common questions. Candidates need realistic practice, useful feedback, and a clear understanding of where they can improve.
              </p>
              <p>
                PrepPilot AI brings those pieces together in one focused preparation experience.
              </p>
            </div>
          </div>
        </section>

        {/* 3. WHAT WE BELIEVE (3 CARDS) */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 md:text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Built around better preparation.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practice with purpose</h3>
              <p className="text-gray-600 leading-relaxed">
                Practice realistic interviews instead of relying only on predictable question lists.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Learn from every answer</h3>
              <p className="text-gray-600 leading-relaxed">
                Understand your strengths, weaknesses, and areas that need more preparation.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Improve continuously</h3>
              <p className="text-gray-600 leading-relaxed">
                Turn interview feedback into targeted practice and measurable progress.
              </p>
            </div>
          </div>
        </section>

        {/* 4. PREPPILOT FLOW */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-16 text-xl md:text-2xl font-bold text-indigo-200">
              <span className="text-white">Prepare</span>
              <ArrowRight className="w-6 h-6 text-indigo-500 rotate-90 md:rotate-0" />
              <span className="text-white">Practice</span>
              <ArrowRight className="w-6 h-6 text-purple-500 rotate-90 md:rotate-0" />
              <span className="text-white">Evaluate</span>
              <ArrowRight className="w-6 h-6 text-fuchsia-500 rotate-90 md:rotate-0" />
              <span className="text-white">Improve</span>
              <ArrowRight className="w-6 h-6 text-rose-500 rotate-90 md:rotate-0" />
              <span className="text-white">Perform</span>
            </div>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              PrepPilot AI connects realistic interview practice with AI-powered evaluation and targeted preparation, helping candidates understand what to work on next.
            </p>
          </div>
        </section>

        {/* 5. PRODUCT PHILOSOPHY */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="sticky top-28">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                Designed for real preparation.
              </h2>
              <p className="text-lg text-gray-600">
                Our features are built on core principles that prioritize growth over simple repetition.
              </p>
            </div>
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Realistic practice</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Practice conversations that feel closer to actual interviews.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Actionable feedback</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Focus on useful feedback instead of meaningless scores.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized improvement</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Use performance signals to identify what deserves attention next.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous progress</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Make preparation an ongoing process rather than a one-time activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. WHO IT IS FOR */}
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center mb-16">
              Built for candidates at every stage.
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Students</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build confidence before entering the placement and interview process.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Early-career professionals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sharpen technical, behavioral, and communication skills for your next opportunity.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Experienced candidates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Practice deliberately and identify the areas that can make your next interview stronger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. DIFFERENTIATOR & CTA */}
        <section className="py-32 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-indigo-600 uppercase mb-8">
            <span>Practice</span>
            <ArrowRight className="w-4 h-4 opacity-50" />
            <span>Feedback</span>
            <ArrowRight className="w-4 h-4 opacity-50" />
            <span>Preparation</span>
            <ArrowRight className="w-4 h-4 opacity-50" />
            <span>Progress</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            The goal isn't more practice.<br/>It's better practice.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-16 max-w-2xl mx-auto">
            PrepPilot AI is designed to connect interview performance with what you should work on next, so every session has a purpose.
          </p>

          <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to prepare smarter?
              </h3>
              <p className="text-lg text-slate-300 mb-10 max-w-lg mx-auto">
                Start practicing and turn your next interview into a better one.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/sign-up">
                  <button className="h-14 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto flex items-center justify-center">
                    Start Free Interview <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </Link>
                <Link to="/how-it-works">
                  <button className="h-14 px-8 rounded-xl bg-transparent border border-slate-700 text-white font-semibold text-lg hover:bg-slate-800 transition-colors w-full sm:w-auto">
                    Explore How It Works
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      {/* 8. GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}

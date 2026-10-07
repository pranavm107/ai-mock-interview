import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use React Router's internal history index to determine if there is a previous route within the app
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100">
      {/* LEFT SIDE - Brand Message (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-white border-r border-gray-100">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_20%,rgba(108,76,244,0.08),transparent_35%)] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_80%,rgba(108,76,244,0.05),transparent_40%)] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-start">
          <button 
            onClick={handleBack} 
            className="group flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to PrepPilot
          </button>
          <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
            <Logo className="h-8" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md mt-auto mb-auto">
          <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-6">
            PREPPILOT AI
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Prepare smarter.<br />
            Interview better.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Get hired.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            Practice realistic AI interviews, understand where you need to improve, and prepare with purpose.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-gray-700 font-medium">Realistic AI interview practice</p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-gray-700 font-medium">Actionable feedback after every interview</p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-gray-700 font-medium">Targeted preparation based on your performance</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          © {new Date().getFullYear()} PrepPilot AI
        </div>
      </div>

      {/* RIGHT SIDE - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Subtle purple glow around auth area */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,76,244,0.03),transparent_60%)] pointer-events-none"></div>
        
        {/* Mobile Logo & Back */}
        <div className="lg:hidden w-full max-w-[400px] mb-8 flex flex-col items-start">
          <button 
            onClick={handleBack} 
            className="group flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to PrepPilot
          </button>
          <div className="w-full flex justify-center">
            <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
              <Logo className="h-8" />
            </Link>
          </div>
        </div>

        <div className="w-full max-w-[440px] relative z-10 flex justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

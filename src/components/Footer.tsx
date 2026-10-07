import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-6 inline-block hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
              <Logo className="h-8" variant="reversed" />
            </Link>
            <p className="font-semibold text-white text-lg mb-3">
              Prepare smarter. Practice better. Get hired.
            </p>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              AI-powered interview preparation that helps you practice realistically, understand your weaknesses, and improve with purpose.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Pricing</Link></li>
              <li><Link to="/generate" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Mock Interviews</Link></li>
              <li><Link to="/preparation" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Assessments</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/career" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Career Coach</Link></li>
              <li><Link to="/resume" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Resume Manager</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Progress & Analytics</Link></li>
              <li><Link to="/preparation" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Interview Preparation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} PrepPilot AI. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Cookie Policy</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

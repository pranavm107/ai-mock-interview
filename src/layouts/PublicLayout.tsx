import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { Brain, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';

const PublicLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-lg border-slate-200/80 shadow-sm' 
            : 'bg-white border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              PrepPilot AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm ${
                    isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full px-6 transition-all shadow-sm">
                Get Started
              </Button>
            </SignUpButton>
          </div>

          <button 
            className="md:hidden p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-6 px-6 flex flex-col gap-6 z-50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`text-lg font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-indigo-600' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex flex-col gap-4">
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full justify-center rounded-full h-12 text-base font-medium border-slate-200">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="w-full justify-center rounded-full h-12 text-base font-medium bg-slate-900 text-white hover:bg-slate-800">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col w-full pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;

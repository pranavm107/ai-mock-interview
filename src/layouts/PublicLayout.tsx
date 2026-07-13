import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { Brain, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const PublicLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  if (isLoaded && isSignedIn) {
    // Completely separate authenticated experience
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
              PrepPilot AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors hover:text-indigo-600 ${
                    isActive ? 'text-indigo-600' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-indigo-600 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <SignInButton mode="modal">
              <Button variant="outline" className="border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700 font-semibold rounded-full px-6 transition-all">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Start Free <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </SignUpButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col gap-2 z-50 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`p-3 rounded-xl font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex flex-col gap-3 pb-2">
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full justify-center rounded-xl h-12 text-base">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="w-full justify-center rounded-xl h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Start Free</Button>
              </SignUpButton>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;


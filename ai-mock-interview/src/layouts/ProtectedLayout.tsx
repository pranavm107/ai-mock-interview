import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopHeader } from '../components/dashboard/TopHeader';
import AuthHandler from '../handlers/AuthHandler';

const ProtectedLayout: React.FC = () => {
  const { isLoaded, userId } = useAuth();

  // Show a loading state while Clerk is determining auth status
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to sign-in page if user is not authenticated
  if (!userId) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <AuthHandler>
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 relative">
      {/* Subtle Background Gradients */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </AuthHandler>
  );
};

export default ProtectedLayout;

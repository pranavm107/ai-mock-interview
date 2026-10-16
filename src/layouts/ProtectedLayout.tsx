import React from 'react';
import { Outlet, Navigate, ScrollRestoration, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopHeader } from '../components/dashboard/TopHeader';
import AuthHandler from '../handlers/AuthHandler';
import { useUiStore } from '../stores/uiStore';

const ProtectedLayout: React.FC = () => {
  const { isLoaded, userId } = useAuth();
  const isFocusMode = useUiStore((state) => state.isFocusMode);
  const location = useLocation();
  const isWorkspace = location.pathname.includes('/workspace');
  const effectiveFocusMode = isFocusMode || isWorkspace;

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
      <div className={`flex h-screen overflow-hidden font-sans relative ${isWorkspace ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {/* Subtle Background Gradients - Hide in focus mode or workspace */}
        {!effectiveFocusMode && (
          <>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4"></div>
          </>
        )}

        {!effectiveFocusMode && <Sidebar />}
        <div className={`flex-1 flex flex-col overflow-hidden relative z-10 ${effectiveFocusMode ? (isWorkspace ? 'bg-slate-950' : 'bg-white') : ''}`}>
          {!effectiveFocusMode && <TopHeader />}
          <main className={`flex-1 ${effectiveFocusMode ? 'p-0 overflow-hidden' : 'p-4 sm:p-5 lg:p-6 overflow-y-auto scroll-smooth'}`}>
            <div className={`mx-auto ${effectiveFocusMode ? 'w-full h-full' : 'max-w-7xl'}`}>
              <ScrollRestoration />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AuthHandler>
  );
};

export default ProtectedLayout;

import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/react';

const ProtectedLayout: React.FC = () => {
  const { isLoaded, userId } = useAuth();

  // Show a loading state while Clerk is determining auth status
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to sign-in page if user is not authenticated
  if (!userId) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for protected routes */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-bold text-lg">AI Mock Interview</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Dashboard</Link>
          <Link to="/generate" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Generate Interview</Link>
          <Link to="/interview/1" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Mock Interview</Link>
          <Link to="/history" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Interview History</Link>
          <Link to="/profile" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Profile</Link>
          <Link to="/settings" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">Settings</Link>
        </nav>
        <div className="p-4 border-t flex items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium">My Account</span>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;

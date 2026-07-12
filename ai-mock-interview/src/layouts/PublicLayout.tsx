import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center w-full border-b">
        <Link to="/" className="text-xl font-bold">AI Mock Interview</Link>
        <nav className="flex gap-4 items-center">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/pricing" className="hover:underline">Pricing</Link>
          <div className="flex gap-2 ml-4">
            <Show when="signed-out">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </Show>
            <Show when="signed-in">
              <Link to="/dashboard" className="text-blue-500 font-semibold mr-2">Go to Dashboard</Link>
              <UserButton />
            </Show>
          </div>
        </nav>
      </header>
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      <footer className="p-4 border-t text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AI Mock Interview. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicLayout;

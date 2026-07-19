import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import ProtectedLayout from '../layouts/ProtectedLayout';

// Public Pages
import Home from '../pages/Home';
import Features from '../pages/Features';
import HowItWorks from '../pages/HowItWorks';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Pricing from '../pages/Pricing';
import SignInPage from '../pages/SignIn';
import SignUpPage from '../pages/SignUp';
import NotFound from '../pages/NotFound';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import Generate from '../pages/Generate';
import Interview from '../pages/Interview';
import InterviewRuntime from '../pages/InterviewRuntime';
import InterviewReportPage from '../pages/InterviewReport';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Resume from '../pages/Resume';
import Analytics from '../pages/Analytics';
import Achievements from '../pages/Achievements';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'features', element: <Features /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'sign-in/*', element: <SignInPage /> },
      { path: 'sign-up/*', element: <SignUpPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'generate', element: <Generate /> },
      { path: 'interview/:id', element: <Interview /> },
      { path: 'session/:sessionId', element: <InterviewRuntime /> },
      { path: 'report/:sessionId', element: <InterviewReportPage /> },
      { path: 'history', element: <History /> },
      { path: 'profile/*', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'resume', element: <Resume /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'achievements', element: <Achievements /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;

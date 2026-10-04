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
import SuggestedInterviewPage from '../pages/SuggestedInterview';
import Interview from '../pages/Interview';
import InterviewRuntime from '../pages/InterviewRuntime';
import MCQRuntime from '../pages/MCQRuntime';
import InterviewReportPage from '../pages/InterviewReport';
import InterviewReplay from '../pages/InterviewReplay';
import InterviewReview from '../pages/InterviewReview';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Resume from '../pages/Resume';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import Achievements from '../pages/Achievements';
import CareerDashboard from '../pages/CareerDashboard';
import { PreparationLanding } from '../pages/PreparationLanding';
import { PreparationCategory } from '../pages/PreparationCategory';
import { PreparationAssessment } from '../pages/PreparationAssessment';
import { PreparationResult } from '../pages/PreparationResult';
import { PreparationHistory } from '../pages/PreparationHistory';
import { PreparationAnalytics } from '../pages/PreparationAnalytics';
import { PreparationRecommendations } from '../pages/PreparationRecommendations';

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
      { path: 'generate/suggested', element: <SuggestedInterviewPage /> },
      { path: 'interview/:id', element: <Interview /> },
      { path: 'session/:sessionId', element: <InterviewRuntime /> },
      { path: 'mcq/:id', element: <MCQRuntime /> },
      { path: 'report/:sessionId', element: <InterviewReportPage /> },
      { path: 'replay/:sessionId', element: <InterviewReplay /> },
      { path: 'review/:sessionId', element: <InterviewReview /> },
      { path: 'history', element: <History /> },
      { path: 'profile/*', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'resume', element: <Resume /> },
      { path: 'analytics', element: <AnalyticsDashboard /> },
      { path: 'achievements', element: <Achievements /> },
      { path: 'career', element: <CareerDashboard /> },
      { path: 'preparation', element: <PreparationLanding /> },
      { path: 'preparation/history', element: <PreparationHistory /> },
      { path: 'preparation/analytics', element: <PreparationAnalytics /> },
      { path: 'preparation/recommendations', element: <PreparationRecommendations /> },
      { path: 'preparation/:category', element: <PreparationCategory /> },
      { path: 'preparation/assessment/:id', element: <PreparationAssessment /> },
      { path: 'preparation/results/:id', element: <PreparationResult /> },
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

import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

const clerkAppearance = {
  variables: {
    colorPrimary: '#6C4CF4',
    colorBackground: '#ffffff',
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorInputBackground: '#ffffff',
    colorInputText: '#111827',
    colorDanger: '#ef4444',
    colorSuccess: '#10b981',
    borderRadius: '12px',
  },
  layout: {
    logoPlacement: 'none',
    socialButtonsPlacement: 'top',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-sm border border-gray-200 rounded-[20px] bg-white w-full',
    headerTitle: 'text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight',
    headerSubtitle: 'text-base text-gray-500 mt-2',
    socialButtonsBlockButton: 'bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl h-12 hover:bg-gray-50 transition-colors',
    socialButtonsBlockButtonText: 'font-semibold text-gray-700',
    dividerLine: 'bg-gray-200',
    dividerText: 'text-gray-400 text-sm font-medium',
    formFieldLabel: 'text-sm font-semibold text-gray-700 mb-1.5',
    formFieldInput: 'h-12 rounded-xl border border-gray-200 bg-white text-gray-900 px-4 focus:ring-2 focus:ring-[#6C4CF4]/20 focus:border-[#6C4CF4] transition-all outline-none',
    formButtonPrimary: 'h-12 rounded-xl bg-gradient-to-r from-[#6C4CF4] to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base shadow-sm hover:shadow transition-all',
    footerActionLink: 'text-[#6C4CF4] hover:text-indigo-700 font-semibold',
    identityPreviewEditButtonIcon: 'text-[#6C4CF4]',
    formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600',
    cardBox: 'shadow-none'
  }
};

const SignInPage: React.FC = () => {
  return (
    <ClerkSignIn 
      path="/sign-in" 
      routing="path" 
      signUpUrl="/sign-up" 
      appearance={clerkAppearance as any}
    />
  );
};

export default SignInPage;

import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex justify-center py-20">
      <ClerkSignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
};

export default SignUpPage;

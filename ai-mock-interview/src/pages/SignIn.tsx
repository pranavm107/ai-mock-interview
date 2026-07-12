import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

const SignInPage: React.FC = () => {
  return (
    <div className="flex justify-center py-20">
      <ClerkSignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;

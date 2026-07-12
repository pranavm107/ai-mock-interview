import React from 'react';
import { SignIn } from '@clerk/react';

const SignInPage: React.FC = () => {
  return (
    <div className="flex justify-center py-20">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;

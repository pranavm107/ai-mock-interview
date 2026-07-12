import React from 'react';
import { SignUp } from '@clerk/react';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex justify-center py-20">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
};

export default SignUpPage;

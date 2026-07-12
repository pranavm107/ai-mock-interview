import React from 'react';
import { UserProfile } from '@clerk/react';

const Profile: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="flex justify-start">
        <UserProfile path="/profile" routing="path" />
      </div>
    </div>
  );
};

export default Profile;

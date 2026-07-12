import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to AI Mock Interview</h1>
      <p className="text-lg text-gray-600 max-w-2xl text-center">
        Prepare for your next job interview with our AI-powered mock interview simulator. 
        Get instant feedback, analyze your performance, and improve your skills.
      </p>
    </div>
  );
};

export default Home;

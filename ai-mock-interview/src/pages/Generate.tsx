import React from 'react';

const Generate: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generate Mock Interview</h1>
      <div className="max-w-xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
        <p className="text-gray-600 mb-4">Select the role and skills you want to be interviewed on.</p>
        {/* Placeholder for form */}
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Start New Interview
        </button>
      </div>
    </div>
  );
};

export default Generate;

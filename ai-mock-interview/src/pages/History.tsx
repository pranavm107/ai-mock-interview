import React from 'react';

const History: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Interview History</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <p className="text-gray-500">No past interviews found.</p>
        </div>
      </div>
    </div>
  );
};

export default History;

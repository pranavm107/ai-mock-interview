import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-2">Recent Interviews</h2>
          <p className="text-gray-500">You haven't completed any interviews yet.</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-2">Performance</h2>
          <p className="text-gray-500">No data available.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { useParams } from 'react-router-dom';

const Interview: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mock Interview {id ? `#${id}` : ''}</h1>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Interview interface goes here.</p>
      </div>
    </div>
  );
};

export default Interview;

import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '' }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700 ${className}`}>
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

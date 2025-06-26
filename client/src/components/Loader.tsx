import React from 'react';

export default function Loader({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" />
        <path className="opacity-75" fill="#2563eb" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
} 
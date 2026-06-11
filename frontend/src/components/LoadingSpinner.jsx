import React from 'react';

export const LoadingSpinner = ({ size = 'md' }) => {
  const s = size === 'sm' ? 16 : size === 'lg' ? 40 : 24;
  return (
    <div className="flex items-center justify-center p-8">
      <svg width={s} height={s} viewBox="0 0 24 24" className="animate-spin">
        <circle cx="12" cy="12" r="10"
          stroke="var(--border-card)" strokeWidth="2" fill="none" />
        <path d="M12 2 A10 10 0 0 1 22 12"
          stroke="var(--brand-primary)" strokeWidth="2"
          strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};

export default LoadingSpinner;

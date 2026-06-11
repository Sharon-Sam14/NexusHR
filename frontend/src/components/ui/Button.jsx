import React from 'react';

const variants = {
  primary: {
    background: 'var(--brand-blue)',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
    border: 'none',
  },
  secondary: {
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-card)',
    boxShadow: 'var(--shadow-card)',
  },
  danger: {
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(220,38,38,0.2)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-5 py-2.5 text-[14px]',
};

export const Button = ({ children, variant = 'secondary', size = 'md', className = '', style: extraStyle = {}, ...props }) => {
  const v = variants[variant] || variants.secondary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-[10px]
        transition-all duration-150 cursor-pointer
        hover:opacity-90 active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/25
        disabled:opacity-40 disabled:cursor-not-allowed select-none
        ${s} ${className}
      `}
      style={{
        fontFamily: 'var(--font-ui)',
        ...v,
        ...extraStyle,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

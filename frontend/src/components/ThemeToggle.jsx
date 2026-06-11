import React from 'react';
import { SunDim, Moon } from '@phosphor-icons/react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-[44px] h-[24px] rounded-full transition-colors duration-300
        focus:outline-none cursor-pointer"
      style={{
        background: isDark ? 'var(--brand-blue)' : '#E5E7EB',
      }}
      aria-label="Toggle theme"
    >
      <span
        className={`
          absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full
          flex items-center justify-center shadow-sm bg-white
          transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isDark ? 'translate-x-[20px]' : 'translate-x-0'}
        `}
      >
        {isDark
          ? <Moon size={10} weight="fill" style={{ color: 'var(--brand-blue)' }} />
          : <SunDim size={10} weight="bold" className="text-amber-400" />
        }
      </span>
    </button>
  );
};

export default ThemeToggle;

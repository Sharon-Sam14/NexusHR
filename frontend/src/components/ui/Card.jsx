// src/components/ui/Card.jsx
// Standard 16px-radius card primitive for the NexusHR design system.

export const Card = ({ children, className = '', hover = false, padding = 'p-5' }) => (
  <div
    className={`rounded-[16px] ${padding} transition-all duration-200 ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      boxShadow: 'var(--shadow-card)',
    }}
  >
    {children}
  </div>
);

// Dark accent card — used for AI co-pilot panel, highlighted metric blocks
export const DarkCard = ({ children, className = '' }) => (
  <div
    className={`rounded-[16px] p-5 ${className}`}
    style={{
      background: 'var(--bg-sidebar)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    {children}
  </div>
);

export default Card;

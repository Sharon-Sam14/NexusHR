// src/components/StatsCard.jsx
// Premium KPI card — NexusHR design system.

import { Card } from './ui/Card';

const iconColors = {
  blue:   { bg: 'var(--brand-blue)',    text: '#fff' },
  green:  { bg: 'var(--color-success)', text: '#fff' },
  orange: { bg: 'var(--color-warning)', text: '#fff' },
  purple: { bg: 'var(--color-purple)',  text: '#fff' },
  red:    { bg: 'var(--color-danger)',  text: '#fff' },
  info:   { bg: 'var(--color-info)',    text: '#fff' },
};

export const StatsCard = ({
  label,
  value,
  delta,
  deltaType,    // 'up' | 'down' | 'neutral'
  description,
  icon: Icon,
  iconColor = 'blue',
  highlight = false,
}) => {
  const ic = iconColors[iconColor] || iconColors.blue;

  return (
    <Card hover className={highlight ? 'relative overflow-hidden' : ''} padding="p-5">
      {/* Subtle gradient overlay for highlight card */}
      {highlight && (
        <div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, transparent 60%)' }}
        />
      )}

      {/* Header row: label + icon */}
      <div className="flex items-start justify-between mb-3">
        <p
          className="text-[11px] font-semibold tracking-[0.08em] uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}
        >
          {label}
        </p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: ic.bg }}
          >
            <Icon size={16} weight="fill" style={{ color: ic.text }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className="text-[36px] font-bold leading-none mb-2"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>

      {/* Delta chip */}
      {delta && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] text-[11px] font-semibold"
            style={{
              fontFamily: 'var(--font-ui)',
              background:
                deltaType === 'up'   ? 'var(--color-success-bg)' :
                deltaType === 'down' ? 'var(--color-danger-bg)'  : 'var(--bg-hover)',
              color:
                deltaType === 'up'   ? 'var(--color-success)' :
                deltaType === 'down' ? 'var(--color-danger)'  : 'var(--text-muted)',
            }}
          >
            {deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '→'} {delta}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            vs last month
          </span>
        </div>
      )}

      {/* Optional description */}
      {description && !delta && (
        <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
    </Card>
  );
};

export default StatsCard;

import React from 'react';

const statusToVariant = (status) => {
  if (!status) return 'default';
  const s = status.toUpperCase();
  if (['APPROVED', 'PRESENT', 'ACTIVE', 'PAID', 'OPEN', 'HIRED', 'ACKNOWLEDGED', 'SUCCESS'].includes(s)) return 'success';
  if (['REJECTED', 'ABSENT', 'TERMINATED', 'DANGER', 'ERROR', 'FAILED'].includes(s)) return 'danger';
  if (['PENDING', 'HALF_DAY', 'LATE', 'SCREENING', 'WARNING'].includes(s)) return 'warning';
  if (['PROCESSED', 'INTERVIEWING', 'ON_LEAVE', 'HOLIDAY', 'OFFER_EXTENDED', 'SUBMITTED', 'INFO'].includes(s)) return 'info';
  if (['IN_REVIEW'].includes(s)) return 'purple';
  if (['PRIMARY'].includes(s)) return 'primary';
  if (['CLOSED', 'INACTIVE'].includes(s)) return 'default';
  return 'default';
};

const variantStyles = {
  success: { background: 'var(--color-success-bg)', color: 'var(--color-success)' },
  danger:  { background: 'var(--color-danger-bg)',  color: 'var(--color-danger)' },
  warning: { background: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  info:    { background: 'var(--color-info-bg)',    color: 'var(--color-info)' },
  purple:  { background: 'var(--color-purple-bg)',  color: 'var(--color-purple)' },
  default: { background: 'var(--bg-hover)',         color: 'var(--text-muted)' },
  primary: { background: 'var(--brand-blue-soft)',  color: 'var(--brand-blue)' },
};

export const Badge = ({ label, status, variant }) => {
  const displayLabel = label || status?.replace(/_/g, ' ') || '';
  const resolvedVariant = variant || statusToVariant(status);
  const style = variantStyles[resolvedVariant] || variantStyles.default;

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-semibold"
      style={{
        background: style.background,
        color: style.color,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.02em',
      }}
    >
      {displayLabel}
    </span>
  );
};

export default Badge;

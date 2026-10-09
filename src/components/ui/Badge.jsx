const TONES = {
  success: 'bg-brand-50 text-brand-700',
  danger: 'bg-red-50 text-state-danger',
  neutral: 'bg-surface-alt text-ink-500',
  info: 'bg-blue-50 text-state-info',
  warn: 'bg-accent-100 text-accent-600',
};

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Maps a backend status string to a tone so every screen colours it identically. */
export function StatusBadge({ status }) {
  const tone =
    status === 'SUCCESS' || status === 'ACTIVE'
      ? 'success'
      : status === 'FAILED' || status === 'DEACTIVATED'
        ? 'danger'
        : 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}

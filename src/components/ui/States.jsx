import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

/** Skeletons are shaped like the content they replace, rather than a centred spinner. */
export function SkeletonRows({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-alt" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-alt" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-surface-alt" />
          </div>
          <div className="h-3 w-16 animate-pulse rounded bg-surface-alt" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ className = 'h-40' }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-alt ${className}`} />;
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="mb-1 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon size={22} />
      </div>
      <p className="font-display text-sm font-semibold text-ink-900">{title}</p>
      {description && <p className="max-w-xs text-xs text-ink-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-state-danger">
        <AlertCircle size={22} />
      </div>
      <p className="max-w-sm text-sm text-ink-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={14} /> Retry
        </Button>
      )}
    </div>
  );
}

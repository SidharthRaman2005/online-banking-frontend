export function Card({ className = '', children }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function CardHeader({ title, action, subtitle }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function SeeAllLink({ children, ...props }) {
  return (
    <button
      type="button"
      className="text-sm font-medium text-accent-600 transition hover:text-accent-500"
      {...props}
    >
      {children}
    </button>
  );
}

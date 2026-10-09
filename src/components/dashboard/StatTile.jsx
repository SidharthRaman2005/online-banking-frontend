import { formatCurrency } from '../../utils/formatters';

const TONES = {
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-100 text-accent-600',
  info: 'bg-blue-50 text-state-info',
  neutral: 'bg-surface-alt text-ink-700',
};

export default function StatTile({ label, value, icon: Icon, tone = 'brand', currency = true, hint }) {
  return (
    <div className={`rounded-2xl p-4 ${TONES[tone]}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium opacity-80">{label}</span>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/70">
            <Icon size={15} />
          </span>
        )}
      </div>
      <p className="money text-xl text-ink-900">
        {currency ? formatCurrency(value) : (value ?? 0).toLocaleString('en-IN')}
      </p>
      {hint && <p className="mt-1 text-[11px] opacity-70">{hint}</p>}
    </div>
  );
}

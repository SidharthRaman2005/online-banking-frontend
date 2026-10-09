import { useState } from 'react';
import { Check, Copy, Wifi } from 'lucide-react';
import { formatCurrency, groupCardNumber, maskAccountNumber } from '../../utils/formatters';

/**
 * The visual anchor of the dashboard. Only the last four digits render by default — the full
 * account number needs a deliberate reveal.
 */
export default function BankCard({ accountNumber, upiId, balance, holder }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setRevealed(true);
    }
  };

  return (
    <div className="relative aspect-[1.65/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-6 text-white shadow-float">
      {/* Soft amber bloom, matching the reference card. */}
      <div className="pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full bg-accent-300/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-brand-300/20 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/70">Online Banking</p>
            <p className="font-display text-base font-semibold">OBS Bank</p>
          </div>
          <Wifi size={20} className="rotate-90 text-white/80" />
        </div>

        <div className="space-y-1">
          <div className="h-7 w-10 rounded-md bg-gradient-to-br from-accent-300 to-accent-500 opacity-90" />
          <p className="pt-2 font-display text-lg tracking-[0.18em] tabular-nums sm:text-xl">
            {revealed ? groupCardNumber(accountNumber) : `•••• •••• ${accountNumber?.slice(-4) ?? ''}`}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] text-white/70">Balance</p>
            <p className="money truncate text-2xl">{formatCurrency(balance)}</p>
            <p className="mt-1 truncate text-[11px] text-white/70">{upiId}</p>
          </div>
          <div className="text-right">
            <p className="truncate text-xs font-medium uppercase tracking-wide">{holder}</p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                className="rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur transition hover:bg-white/25"
              >
                {revealed ? 'Hide' : 'Reveal'}
              </button>
              <button
                type="button"
                onClick={copy}
                aria-label="Copy account number"
                className="rounded-lg bg-white/15 p-1.5 backdrop-blur transition hover:bg-white/25"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Account {maskAccountNumber(accountNumber)}</span>
    </div>
  );
}

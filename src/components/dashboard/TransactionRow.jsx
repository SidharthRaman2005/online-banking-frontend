import { ArrowDownLeft, ArrowUpRight, Send } from 'lucide-react';
import { formatRelative, formatSignedCurrency } from '../../utils/formatters';

const ICONS = {
  DEPOSIT: ArrowDownLeft,
  WITHDRAW: ArrowUpRight,
  TRANSFER: Send,
};

function titleOf(txn) {
  if (txn.type === 'TRANSFER') {
    return txn.direction === 'CREDIT'
      ? `From ${txn.counterpartyName ?? 'another account'}`
      : `To ${txn.counterpartyName ?? 'another account'}`;
  }
  return txn.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal';
}

export default function TransactionRow({ transaction, onClick }) {
  const Icon = ICONS[transaction.type] ?? Send;
  const isCredit = transaction.direction === 'CREDIT';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-surface-alt"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink-900">{titleOf(transaction)}</span>
        <span className="block truncate text-xs text-ink-500">
          {transaction.description} · {formatRelative(transaction.createdAt)}
        </span>
      </span>

      {/* Sign and colour both carry the meaning, so it never depends on colour alone. */}
      <span
        className={`money shrink-0 text-sm ${isCredit ? 'text-state-success' : 'text-ink-900'}`}
      >
        {formatSignedCurrency(transaction.amount, transaction.direction)}
      </span>
    </button>
  );
}

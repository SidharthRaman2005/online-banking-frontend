import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency, formatDate, formatSignedCurrency } from '../../utils/formatters';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-line py-2.5 last:border-0">
      <span className="text-xs text-ink-500">{label}</span>
      <span className="text-right text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title="Transaction details"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="mb-4 rounded-xl bg-surface-alt p-4 text-center">
        <p
          className={`money text-2xl ${
            transaction.direction === 'CREDIT' ? 'text-state-success' : 'text-ink-900'
          }`}
        >
          {formatSignedCurrency(transaction.amount, transaction.direction)}
        </p>
        <p className="mt-1 text-xs text-ink-500">{transaction.description}</p>
      </div>

      <Row label="Reference" value={<span className="tabular-nums">{transaction.transactionReference}</span>} />
      <Row label="Type" value={transaction.type} />
      <Row label="Direction" value={transaction.direction} />
      <Row label="Status" value={<StatusBadge status={transaction.status} />} />
      <Row label="From" value={transaction.senderAccountNumber ?? '—'} />
      <Row label="To" value={transaction.receiverAccountNumber ?? '—'} />
      {transaction.counterpartyName && (
        <Row label="Counterparty" value={transaction.counterpartyName} />
      )}
      <Row label="Balance after" value={formatCurrency(transaction.balanceAfterTransaction)} />
      <Row label="Date" value={formatDate(transaction.createdAt)} />
    </Modal>
  );
}

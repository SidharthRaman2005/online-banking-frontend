import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card } from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/ui/States';
import TransactionRow from '../../components/dashboard/TransactionRow';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';
import { transactionService } from '../../services/transactionService';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'DEPOSIT', label: 'Deposits' },
  { id: 'WITHDRAW', label: 'Withdrawals' },
  { id: 'TRANSFER', label: 'Transfers' },
];

export default function TransactionHistory() {
  const [type, setType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(0);

  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await transactionService.history({
        type,
        page,
        size: 10,
        search: debouncedSearch || undefined,
        from: range.from || undefined,
        to: range.to || undefined,
      });
      setResult(data);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [type, page, debouncedSearch, range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page title="Transactions" subtitle="Every deposit, withdrawal and transfer">
      <Card>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setType(id);
                  setPage(0);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
                  type === id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-alt text-ink-500 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
              />
              <input
                type="search"
                placeholder="Search reference or note"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search transactions"
                className="field w-56 pl-9 py-2.5 text-xs"
              />
            </div>
            <input
              type="date"
              value={range.from}
              aria-label="From date"
              onChange={(event) => {
                setRange((current) => ({ ...current, from: event.target.value }));
                setPage(0);
              }}
              className="field w-36 py-2.5 text-xs"
            />
            <input
              type="date"
              value={range.to}
              aria-label="To date"
              onChange={(event) => {
                setRange((current) => ({ ...current, to: event.target.value }));
                setPage(0);
              }}
              className="field w-36 py-2.5 text-xs"
            />
          </div>
        </div>

        {status === 'loading' && <SkeletonRows rows={6} />}
        {status === 'error' && <ErrorState message={error} onRetry={load} />}

        {status === 'ready' &&
          (result?.content?.length ? (
            <>
              <div className="-mx-2 space-y-0.5">
                {result.content.map((txn) => (
                  <TransactionRow
                    key={txn.transactionReference + txn.direction + txn.createdAt}
                    transaction={txn}
                    onClick={() => setSelected(txn)}
                  />
                ))}
              </div>
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                totalElements={result.totalElements}
                onChange={setPage}
              />
            </>
          ) : (
            <EmptyState
              title="No transactions found"
              description="Try a different filter, or make your first deposit."
              action={
                <Link
                  to="/deposit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700"
                >
                  Make a deposit
                </Link>
              }
            />
          ))}
      </Card>

      <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
    </Page>
  );
}

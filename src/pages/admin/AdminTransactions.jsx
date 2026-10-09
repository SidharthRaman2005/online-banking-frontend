import { useCallback, useEffect, useState } from 'react';
import { Receipt, Search } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card } from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import DataTable from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TYPES = ['ALL', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'];
const STATUSES = ['ALL', 'SUCCESS', 'FAILED'];

export default function AdminTransactions() {
  const [type, setType] = useState('ALL');
  const [status, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      setResult(
        await adminService.transactions({
          type,
          status,
          search: debounced || undefined,
          page,
          size: 10,
        }),
      );
      setLoadState('ready');
    } catch (err) {
      setError(err.message);
      setLoadState('error');
    }
  }, [type, status, debounced, page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => <span className="tabular-nums text-xs font-medium">{row.transactionReference}</span>,
    },
    { key: 'type', header: 'Type', render: (row) => row.type },
    {
      key: 'ledger',
      header: 'Ledger account',
      render: (row) => (
        <span>
          {row.ledgerAccountHolder}
          <span className="block text-xs tabular-nums text-ink-500">{row.ledgerAccountNumber}</span>
        </span>
      ),
    },
    {
      key: 'parties',
      header: 'From → To',
      render: (row) => (
        <span className="text-xs tabular-nums text-ink-500">
          {row.senderAccountNumber ?? '—'} → {row.receiverAccountNumber ?? '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="money">{formatCurrency(row.amount)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-xs text-ink-500">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <Page title="Transactions" subtitle="Full ledger — a transfer appears as two rows, one per side">
      <Card>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setType(id);
                  setPage(0);
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  type === id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-alt text-ink-500 hover:bg-brand-50'
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(0);
              }}
              aria-label="Filter by status"
              className="field w-32 py-2.5 text-xs"
            >
              {STATUSES.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
              />
              <input
                type="search"
                placeholder="Search reference or account"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search transactions"
                className="field w-60 py-2.5 pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {loadState === 'error' ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={result?.content}
              loading={loadState === 'loading'}
              rowKey={(row) => row.id}
              empty={<EmptyState title="No transactions found" icon={Receipt} />}
            />
            {result && (
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                totalElements={result.totalElements}
                onChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </Page>
  );
}

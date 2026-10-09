import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Users } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import DataTable from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [pendingChange, setPendingChange] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setResult(await adminService.users({ search: debounced || undefined, page, size: 10 }));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [debounced, page]);

  useEffect(() => {
    load();
  }, [load]);

  const applyStatusChange = async () => {
    setSaving(true);
    try {
      const nextStatus = pendingChange.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      await adminService.updateStatus(pendingChange.id, nextStatus);
      toast.success(
        `${pendingChange.username} ${nextStatus === 'ACTIVE' ? 'reactivated' : 'deactivated'}`,
      );
      setPendingChange(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <span>
          <span className="font-medium">{row.username}</span>
          <span className="block text-xs text-ink-500">{row.email}</span>
        </span>
      ),
    },
    {
      key: 'account',
      header: 'Account',
      render: (row) => (
        <span className="tabular-nums text-xs">
          {row.accountNumber ?? '—'}
          <span className="block text-ink-500">{row.upiId ?? '—'}</span>
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => <span className="money">{formatCurrency(row.balance)}</span>,
    },
    { key: 'role', header: 'Role', render: (row) => <span className="text-xs">{row.role}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'joined',
      header: 'Joined',
      render: (row) => <span className="text-xs text-ink-500">{formatDateOnly(row.createdAt)}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) =>
        row.role === 'ADMIN' ? (
          <span className="text-xs text-ink-300">—</span>
        ) : (
          <Button
            size="sm"
            variant={row.status === 'ACTIVE' ? 'danger' : 'secondary'}
            onClick={() => setPendingChange(row)}
          >
            {row.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
          </Button>
        ),
    },
  ];

  return (
    <Page title="Users" subtitle="Search and manage every registered user">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              type="search"
              placeholder="Search name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search users"
              className="field w-64 py-2.5 pl-9 text-xs"
            />
          </div>
        </div>

        {status === 'error' ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={result?.content}
              loading={status === 'loading'}
              rowKey={(row) => row.id}
              empty={<EmptyState title="No users found" icon={Users} />}
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

      <Modal
        open={Boolean(pendingChange)}
        onClose={() => setPendingChange(null)}
        title={pendingChange?.status === 'ACTIVE' ? 'Deactivate user' : 'Reactivate user'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingChange(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant={pendingChange?.status === 'ACTIVE' ? 'danger' : 'primary'}
              onClick={applyStatusChange}
              loading={saving}
            >
              {pendingChange?.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </>
        }
      >
        {pendingChange?.status === 'ACTIVE' ? (
          <p>
            <strong>{pendingChange?.username}</strong> will be unable to sign in, and their account
            will be frozen for deposits, withdrawals and transfers. You can reverse this from this
            same screen.
          </p>
        ) : (
          <p>
            <strong>{pendingChange?.username}</strong> will regain access to their account and be
            able to transact again.
          </p>
        )}
      </Modal>
    </Page>
  );
}

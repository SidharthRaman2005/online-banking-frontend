import { useEffect, useState } from 'react';
import { Building2, Receipt, UserCheck, Users, Wallet } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card, CardHeader } from '../../components/ui/Card';
import StatTile from '../../components/dashboard/StatTile';
import DataTable from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, SkeletonBlock } from '../../components/ui/States';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = async () => {
    setStatus('loading');
    try {
      const [statsData, transactions] = await Promise.all([
        adminService.stats(),
        adminService.transactions({ page: 0, size: 6 }),
      ]);
      setStats(statsData);
      setRecent(transactions.content);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => <span className="tabular-nums text-xs">{row.transactionReference}</span>,
    },
    { key: 'type', header: 'Type', render: (row) => row.type },
    {
      key: 'account',
      header: 'Ledger account',
      render: (row) => (
        <span>
          {row.ledgerAccountHolder}
          <span className="block text-xs text-ink-500 tabular-nums">{row.ledgerAccountNumber}</span>
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
    <Page title="Admin dashboard" subtitle="System-wide monitoring">
      {status === 'error' && (
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      )}

      {status === 'loading' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24" />
            ))}
          </div>
          <SkeletonBlock className="h-72" />
        </div>
      )}

      {status === 'ready' && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Total users"
              value={stats.totalUsers}
              icon={Users}
              tone="brand"
              currency={false}
              hint={`${stats.activeUsers} active · ${stats.deactivatedUsers} deactivated`}
            />
            <StatTile
              label="Bank accounts"
              value={stats.totalAccounts}
              icon={Building2}
              tone="info"
              currency={false}
            />
            <StatTile
              label="Operations"
              value={stats.totalTransactions}
              icon={Receipt}
              tone="accent"
              currency={false}
              hint="Counted by reference, not ledger rows"
            />
            <StatTile
              label="Money in system"
              value={stats.totalMoneyInSystem}
              icon={Wallet}
              tone="neutral"
            />
          </div>

          <Card>
            <CardHeader title="Recent activity" subtitle="Latest ledger rows across all accounts" />
            <DataTable
              columns={columns}
              rows={recent}
              rowKey={(row) => row.id}
              empty={<EmptyState title="No activity yet" icon={UserCheck} />}
            />
          </Card>
        </div>
      )}
    </Page>
  );
}

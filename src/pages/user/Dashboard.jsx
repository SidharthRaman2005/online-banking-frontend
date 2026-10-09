import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, Send, TrendingDown, TrendingUp } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card, CardHeader, SeeAllLink } from '../../components/ui/Card';
import { EmptyState, ErrorState, SkeletonBlock, SkeletonRows } from '../../components/ui/States';
import BankCard from '../../components/dashboard/BankCard';
import StatTile from '../../components/dashboard/StatTile';
import BalanceChart from '../../components/dashboard/BalanceChart';
import TransactionRow from '../../components/dashboard/TransactionRow';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';
import { userService } from '../../services/userService';
import { formatDateOnly } from '../../utils/formatters';

const ACTIONS = [
  { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { to: '/transfer', label: 'Transfer', icon: Send },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setData(await userService.dashboard());
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page title="Overview" subtitle="Your account at a glance">
      {status === 'error' && (
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      )}

      {status === 'loading' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <SkeletonBlock className="h-56" />
            <Card>
              <SkeletonRows />
            </Card>
          </div>
          <SkeletonBlock className="h-96" />
        </div>
      )}

      {status === 'ready' && data && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <BankCard
                accountNumber={data.accountNumber}
                upiId={data.upiId}
                balance={data.balance}
                holder={data.username}
              />
              <div className="grid grid-cols-3 gap-3 sm:w-40 sm:grid-cols-1">
                {ACTIONS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white p-4 shadow-card transition hover:bg-brand-50"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon size={16} />
                    </span>
                    <span className="text-xs font-medium text-ink-700">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader
                title="Recent transactions"
                action={<SeeAllLink onClick={() => navigate('/transactions')}>See all</SeeAllLink>}
              />
              {data.recentTransactions?.length ? (
                <div className="-mx-2 space-y-0.5">
                  {data.recentTransactions.map((txn) => (
                    <TransactionRow
                      key={txn.transactionReference + txn.direction}
                      transaction={txn}
                      onClick={() => setSelected(txn)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No transactions yet"
                  description="Your deposits, withdrawals and transfers will appear here."
                  action={
                    <Link
                      to="/deposit"
                      className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700"
                    >
                      Make a deposit
                    </Link>
                  }
                />
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Balance trend" subtitle="Derived from your ledger" />
              <BalanceChart
                transactions={data.recentTransactions}
                currentBalance={data.balance}
              />
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <StatTile label="Income" value={data.totalIncome} icon={TrendingUp} tone="brand" />
              <StatTile label="Expense" value={data.totalExpense} icon={TrendingDown} tone="accent" />
            </div>

            <Card>
              <CardHeader title="Account details" />
              <dl className="space-y-3 text-sm">
                {[
                  ['UPI ID', data.upiId],
                  ['Email', data.email],
                  ['Opened on', formatDateOnly(data.accountCreatedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-xs text-ink-500">{label}</dt>
                    <dd className="truncate font-medium text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      )}

      <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
    </Page>
  );
}

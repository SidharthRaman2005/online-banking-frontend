import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

/**
 * Replays the balance trend backwards from the current balance using each row's
 * `balanceAfterTransaction`, so the curve is derived from the ledger rather than invented.
 */
function buildSeries(transactions, currentBalance) {
  if (!transactions?.length) return [];

  const ordered = [...transactions].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  const points = ordered.map((txn) => ({
    label: new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    balance: Number(txn.balanceAfterTransaction),
  }));

  return [{ label: 'Start', balance: points[0]?.balance ?? Number(currentBalance ?? 0) }, ...points];
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white shadow-float">
      {formatCurrency(payload[0].value)}
    </div>
  );
}

export default function BalanceChart({ transactions, currentBalance }) {
  const data = useMemo(
    () => buildSeries(transactions, currentBalance),
    [transactions, currentBalance],
  );

  if (data.length < 2) {
    return (
      <div className="grid h-52 place-items-center rounded-xl bg-surface-alt/60 text-xs text-ink-500">
        Make a few transactions to see your balance trend.
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#059669', strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#balanceFill)"
            dot={false}
            activeDot={{ r: 5, fill: '#fff', stroke: '#059669', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

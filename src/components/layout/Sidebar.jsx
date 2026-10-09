import { NavLink } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Building2,
  LayoutGrid,
  LogOut,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initialsOf } from '../../utils/formatters';

const USER_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { to: '/transfer', label: 'Transfer', icon: Send },
  { to: '/fd', label: 'Fixed Deposits', icon: Building2 },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/loan', label: 'Loans', icon: Building2 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: Settings },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/accounts', label: 'Accounts', icon: Building2 },
  { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { to: '/admin/activation-requests', label: 'Activation Requests', icon: ShieldCheck },
];

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-600 text-white shadow-card'
            : 'text-ink-500 hover:bg-brand-50 hover:text-brand-700'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

export default function Sidebar({ variant = 'user', open = false, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const items = variant === 'admin' ? ADMIN_NAV : USER_NAV;

  const content = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
            O
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">
            OBS<span className="text-brand-600">.</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-alt lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {items.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onClose} />
        ))}

        {isAdmin && variant === 'user' && (
          <NavItem to="/admin" label="Admin panel" icon={ShieldCheck} onNavigate={onClose} />
        )}
      </nav>

      <div className="space-y-4">
        {variant === 'user' && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-accent-100 p-4">
            <p className="font-display text-sm font-semibold leading-snug text-ink-900">
              Simulated banking,
              <br />
              real workflows.
            </p>
            <p className="mt-1 text-xs text-ink-500">No live payment networks involved.</p>
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-surface-line pt-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {initialsOf(user?.username)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user?.username}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="rounded-lg p-2 text-ink-500 transition hover:bg-red-50 hover:text-state-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-surface-line bg-white lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-white shadow-float transition-transform ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}

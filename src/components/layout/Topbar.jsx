import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { initialsOf } from '../../utils/formatters';

export default function Topbar({ title, subtitle, onOpenMenu }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    notificationService
      .unreadCount()
      .then((data) => active && setUnread(data.unread ?? 0))
      .catch(() => {
        // A failing badge must never break the page it sits on.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-surface-line bg-white px-5 py-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="rounded-lg p-2 text-ink-700 hover:bg-surface-alt lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          className="relative rounded-xl bg-surface-alt p-2.5 text-ink-700 transition hover:bg-brand-50"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2.5 rounded-xl bg-surface-alt py-1.5 pl-1.5 pr-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-xs font-semibold text-brand-700">
            {initialsOf(user?.username)}
          </span>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-tight text-ink-900">{user?.username}</p>
            <p className="text-[11px] leading-tight text-ink-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

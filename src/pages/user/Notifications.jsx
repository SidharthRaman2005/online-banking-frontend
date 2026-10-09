import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BellRing, Check, Eye, Trash2 } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card } from '../../components/ui/Card';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/ui/States';
import { notificationService } from '../../services/notificationService';
import { formatRelative } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export default function Notifications() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = async () => {
    setStatus('loading');
    try {
      setItems(await notificationService.list());
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      const updated = await notificationService.markRead(id);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isActivationRequest = (message) =>
    typeof message === 'string' && message.toLowerCase().includes('activation request');

  return (
    <Page title="Notifications" subtitle="In-app only — no SMS or email is sent">
      <Card>
        {status === 'loading' && <SkeletonRows rows={5} />}
        {status === 'error' && <ErrorState message={error} onRetry={load} />}

        {status === 'ready' &&
          (items.length ? (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 rounded-xl p-4 transition ${
                    item.read ? 'bg-white' : 'bg-brand-50/60'
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      item.read ? 'bg-surface-alt text-ink-500' : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    <BellRing size={15} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-900">{item.message}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {formatRelative(item.createdAt)}
                      {!item.read && ' · Unread'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {isAdmin && isActivationRequest(item.message) && (
                      <button
                        type="button"
                        onClick={() => navigate('/admin/activation-requests')}
                        aria-label="Review activation request"
                        className="rounded-lg p-2 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                        title="Review request"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        aria-label="Mark as read"
                        className="rounded-lg p-2 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Check size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label="Delete notification"
                      className="rounded-lg p-2 text-ink-500 transition hover:bg-red-50 hover:text-state-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nothing here yet"
              description="Deposits, withdrawals and transfers will show up as notifications."
              icon={BellRing}
            />
          ))}
      </Card>
    </Page>
  );
}

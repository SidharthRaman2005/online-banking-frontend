import { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Page from '../../components/layout/Page';
import { formatDateOnly } from '../../utils/formatters';

export default function AdminActivationRequests() {
  const [requests, setRequests] = useState([]);

  const load = () => {
    api.get('/admin/activation-requests')
      .then((data) => setRequests(data || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const accept = (id) => api.put(`/admin/activation-requests/${id}/accept`).then(load).catch(() => {});
  const decline = (id) => api.put(`/admin/activation-requests/${id}/decline`).then(load).catch(() => {});
  const activateAccount = (userId) =>
    api.put(`/admin/users/${userId}/status`, { status: 'ACTIVE' }).then(load).catch(() => {});

  return (
    <Page>
      <h2 className="text-lg font-medium">Activation requests</h2>
      <div className="mt-4 grid gap-3">
        {requests.length === 0 && <div className="text-sm text-ink-500">No requests found.</div>}
        {requests.map((r) => (
          <div key={r.id} className="rounded-md border p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{r.username} — {formatDateOnly(r.createdAt)}</div>
              <div className="text-xs text-ink-500 mt-1">{r.message}</div>
              <div className="text-xs text-ink-500 mt-1">Status: {r.status}</div>
            </div>
            <div className="flex gap-2">
              {r.status === 'PENDING' && (
                <>
                  <Button size="sm" onClick={() => accept(r.id)}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => decline(r.id)}>Decline</Button>
                </>
              )}
              {r.status === 'ACCEPTED' && (
                <Button size="sm" onClick={() => activateAccount(r.userId)}>Activate account</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

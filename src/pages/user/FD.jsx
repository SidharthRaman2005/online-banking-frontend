import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Page from '../../components/layout/Page';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';

export default function FD() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(null);
  const [agree, setAgree] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fds, setFds] = useState([]);

  useEffect(() => {
    const defaultTerms = [
      { months: 6, interest: '5.50% p.a.', rate: 5.5 },
      { months: 12, interest: '6.00% p.a.', rate: 6.0 },
      { months: 24, interest: '6.50% p.a.', rate: 6.5 },
      { months: 36, interest: '7.00% p.a.', rate: 7.0 },
    ];

    api.get('/fd/terms')
      .then((res) => {
        const data = res?.terms ? res.terms : Array.isArray(res) ? res : (res?.terms ?? []);
        // If backend returned nothing useful, fall back to defaults so the UI remains usable.
        setTerms((data && data.length) ? data : defaultTerms);
      })
      .catch(() => {
        toast.error('Could not load FD terms — using default terms');
        setTerms(defaultTerms);
      })
      .finally(() => setLoading(false));
    // load existing FDs for the user
    fetchFds();
  }, []);

  const fetchFds = () => {
    api.get('/fd')
      .then((res) => setFds(res || []))
      .catch(() => {});
  };

  const parsedAmount = () => {
    try {
      return parseFloat(amount);
    } catch { return 0; }
  };

  const previewRate = () => {
    const sel = terms.find((t) => t.months === Number(term));
    return sel ? sel.interest : '-';
  };

  const createFd = async () => {
    if (!agree) return toast.error('Please accept the terms and conditions');
    if (!term) return toast.error('Select a term');
    const amt = parsedAmount();
    if (isNaN(amt) || amt < 100) return toast.error('Enter an amount at least 100');

    setCreating(true);
    try {
      await api.post('/fd', { amount: amt, termMonths: Number(term) });
      toast.success('Fixed deposit created');
      setAmount('');
      setTerm(null);
      setAgree(false);
      fetchFds();
    } catch (err) {
      toast.error(err.message || 'Failed to create FD');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Page title="Fixed Deposits" subtitle="Create a fixed deposit from your savings">
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-medium">About Fixed Deposits</h3>
          <p className="mt-2 text-sm text-ink-600">
            A Fixed Deposit (FD) lets you earn higher interest by locking away a portion of your savings
            for a fixed term. FDs are a safe, predictable way to grow your money with guaranteed returns.
            When you create an FD, the selected amount is moved from your savings account into the FD and
            held until maturity. Early withdrawals may be permitted but usually reduce the interest earned.
            Please review the available terms and interest rates below before creating an FD.
          </p>
          <p className="mt-2 text-sm text-ink-600">
            Interest is paid at the end of the FD term or as per the product rules. Nomination and tax
            rules apply. For full details, contact customer service or visit a branch.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-md font-medium">Choose term & amount</h4>
            {loading ? (
              <div className="mt-4">Loading terms...</div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-ink-600">Amount (₹)</label>
                  <Input placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm text-ink-600">Term</label>
                  <div className="mt-2 space-y-2">
                    {terms.map((t) => (
                      <label key={t.months} className="flex items-center gap-3">
                        <input type="radio" name="term" value={t.months} checked={String(term) === String(t.months)} onChange={() => setTerm(t.months)} />
                        <div className="text-sm">{t.months} months — {t.interest}</div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-md font-medium">Terms & preview</h4>
            <div className="mt-4 space-y-3">
              <div className="text-sm">Selected term: <span className="font-medium">{term ?? '—'}</span></div>
              <div className="text-sm">Interest: <span className="font-medium">{previewRate()}</span></div>
              <div className="text-sm text-ink-600">Early withdrawal may attract penalties and reduced interest. FD interest is calculated as per the selected term and compounded annually.</div>

              <label className="mt-4 flex items-start gap-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="text-sm">I have read and accept the terms and conditions for this FD.</span>
              </label>

              <div className="mt-4 flex justify-end">
                <Button variant="primary" loading={creating} onClick={createFd}>Create FD</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-medium">Your Fixed Deposits</h3>
          <div className="grid gap-4">
            {fds.length === 0 && <div className="text-sm text-ink-500">You have no active fixed deposits.</div>}
            {fds.map((f) => (
              <div key={f.id} className="rounded-2xl bg-white p-4 shadow flex items-center justify-between">
                <div>
                  <div className="text-sm text-ink-500">Amount</div>
                  <div className="font-medium">{formatCurrency(f.amount)}</div>
                  <div className="text-xs text-ink-500 mt-1">Started: {formatDateOnly(f.startAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-ink-500">Matures</div>
                  <div className="font-medium">{formatDateOnly(f.maturityAt)}</div>
                  <div className="text-xs text-ink-500 mt-1">Maturity value: {formatCurrency(f.maturityAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </Page>
  );
}

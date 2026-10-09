import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BadgeCheck, Loader2 } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { SkeletonBlock } from '../../components/ui/States';
import { userService } from '../../services/userService';
import { transactionService } from '../../services/transactionService';
import { upiService } from '../../services/upiService';
import { formatCurrency } from '../../utils/formatters';
import { ACCOUNT_NUMBER_RULE, UPI_RULE, validateAmount } from '../../utils/validators';

const TABS = [
  { id: 'account', label: 'Account number' },
  { id: 'upi', label: 'UPI ID' },
];

export default function Transfer() {
  const [tab, setTab] = useState('account');
  const [balance, setBalance] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [payee, setPayee] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadBalance = () =>
    userService
      .dashboard()
      .then((data) => setBalance(data.balance))
      .catch((err) => toast.error(err.message));

  useEffect(() => {
    loadBalance();
  }, []);

  // Switching tabs clears the other route's state so only one receiver is ever sent.
  const switchTab = (next) => {
    setTab(next);
    setPayee(null);
    setErrors({});
    setAccountNumber('');
    setUpiId('');
  };

  const resolvePayee = async () => {
    const candidate = upiId.trim();
    if (!UPI_RULE.test(candidate)) {
      setPayee(null);
      setErrors((current) => ({ ...current, upiId: 'UPI ID must look like username@obs' }));
      return;
    }

    setResolving(true);
    setErrors((current) => ({ ...current, upiId: null }));
    try {
      setPayee(await upiService.resolve(candidate));
    } catch (err) {
      setPayee(null);
      setErrors((current) => ({ ...current, upiId: err.message }));
    } finally {
      setResolving(false);
    }
  };

  const validate = () => {
    const next = { amount: validateAmount(amount, { max: balance ?? 0 }) };

    if (tab === 'account') {
      next.accountNumber = ACCOUNT_NUMBER_RULE.test(accountNumber.trim())
        ? null
        : 'Enter a valid 10-digit account number';
    } else {
      next.upiId = payee ? null : 'Confirm the payee before sending';
    }
    return next;
  };

  const onReview = (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (!Object.values(next).some(Boolean)) setConfirming(true);
  };

  const onConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = {
        amount: Number(amount),
        description: description.trim() || undefined,
        ...(tab === 'account'
          ? { receiverAccountNumber: accountNumber.trim() }
          : { receiverUpiId: upiId.trim() }),
      };
      const txn = await transactionService.transfer(payload);

      toast.success(`${formatCurrency(txn.amount)} sent to ${txn.counterpartyName ?? 'the payee'}`);
      setAmount('');
      setDescription('');
      setAccountNumber('');
      setUpiId('');
      setPayee(null);
      setConfirming(false);
      await loadBalance();
    } catch (err) {
      setConfirming(false);
      setErrors(err.errors ?? {});
      toast.error(err.message);
      loadBalance();
    } finally {
      setSubmitting(false);
    }
  };

  const numericAmount = Number(amount || 0);
  const receiverLabel = tab === 'account' ? accountNumber : (payee?.accountHolderName ?? upiId);

  return (
    <Page title="Transfer" subtitle="Send money to another OBS account">
      <div className="mx-auto max-w-xl space-y-5">
        <Card>
          <p className="text-xs text-ink-500">Available balance</p>
          {balance === null ? (
            <SkeletonBlock className="mt-2 h-8 w-40" />
          ) : (
            <p className="money mt-1 text-3xl text-ink-900">{formatCurrency(balance)}</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Send money" />

          <div
            role="tablist"
            aria-label="Transfer method"
            className="mb-5 flex gap-1 rounded-xl bg-surface-alt p-1"
          >
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => switchTab(id)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === id ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={onReview} className="space-y-4" noValidate>
            {tab === 'account' ? (
              <Input
                label="Receiver account number"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={accountNumber}
                onChange={(event) => {
                  setAccountNumber(event.target.value.replace(/\D/g, ''));
                  setErrors((current) => ({ ...current, accountNumber: null }));
                }}
                error={errors.accountNumber}
                hint="There is no lookup for account numbers — check it carefully."
              />
            ) : (
              <div className="space-y-2">
                <Input
                  label="Receiver UPI ID"
                  placeholder="rahul@obs"
                  value={upiId}
                  onChange={(event) => {
                    setUpiId(event.target.value);
                    setPayee(null);
                    setErrors((current) => ({ ...current, upiId: null }));
                  }}
                  onBlur={resolvePayee}
                  error={errors.upiId}
                />
                {resolving && (
                  <p className="flex items-center gap-2 text-xs text-ink-500">
                    <Loader2 size={13} className="animate-spin" /> Looking up payee…
                  </p>
                )}
                {payee && (
                  <div className="flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                    <BadgeCheck size={16} className="shrink-0 text-brand-600" />
                    <span>
                      Paying <strong>{payee.accountHolderName}</strong> · {payee.upiId}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Input
              label="Amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              prefix="₹"
              placeholder="0.00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setErrors((current) => ({ ...current, amount: null }));
              }}
              error={errors.amount}
            />

            <Input
              label="Description (optional)"
              placeholder="Rent"
              maxLength={200}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={balance === null || (tab === 'upi' && !payee)}
            >
              Review transfer
            </Button>
          </form>
        </Card>
      </div>

      {/* A transfer is irreversible in this system, so the user looks at it once before sending. */}
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm transfer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onConfirm} loading={submitting}>
              Send money
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl bg-surface-alt p-4 text-center">
            <p className="money text-2xl text-ink-900">{formatCurrency(numericAmount)}</p>
            <p className="mt-1 text-xs text-ink-500">to {receiverLabel}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Balance after</span>
            <span className="money">{formatCurrency(Number(balance ?? 0) - numericAmount)}</span>
          </div>
          <p className="text-xs text-ink-500">This cannot be undone once sent.</p>
        </div>
      </Modal>
    </Page>
  );
}

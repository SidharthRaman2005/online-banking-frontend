import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Page from '../../components/layout/Page';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { SkeletonBlock } from '../../components/ui/States';
import { userService } from '../../services/userService';
import { transactionService } from '../../services/transactionService';
import { formatCurrency } from '../../utils/formatters';
import { validateAmount } from '../../utils/validators';

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

/**
 * Deposit and withdraw are the same form with one flag: whether the amount is capped by the
 * current balance.
 */
export default function MoneyForm({ mode }) {
  const isWithdraw = mode === 'withdraw';

  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadBalance = () =>
    userService
      .dashboard()
      .then((data) => setBalance(data.balance))
      .catch((err) => toast.error(err.message));

  useEffect(() => {
    loadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numericAmount = Number(amount || 0);
  const projected = isWithdraw
    ? Number(balance ?? 0) - numericAmount
    : Number(balance ?? 0) + numericAmount;

  const validate = () =>
    validateAmount(amount, isWithdraw ? { max: balance ?? 0 } : undefined);

  const onReview = (event) => {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (!message) setConfirming(true);
  };

  const onConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = { amount: Number(amount), description: description.trim() || undefined };
      const txn = isWithdraw
        ? await transactionService.withdraw(payload)
        : await transactionService.deposit(payload);

      toast.success(
        `${formatCurrency(txn.amount)} ${isWithdraw ? 'withdrawn' : 'deposited'} successfully`,
      );
      setAmount('');
      setDescription('');
      setConfirming(false);
      await loadBalance();
    } catch (err) {
      // The balance can change between render and submit, so the server's answer always wins.
      setConfirming(false);
      setError(err.errors?.amount ?? err.message);
      toast.error(err.message);
      loadBalance();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page
      title={isWithdraw ? 'Withdraw' : 'Deposit'}
      subtitle={isWithdraw ? 'Take money out of your account' : 'Simulated top-up — no payment gateway'}
    >
      <div className="mx-auto max-w-xl space-y-5">
        <Card>
          <p className="text-xs text-ink-500">Current balance</p>
          {balance === null ? (
            <SkeletonBlock className="mt-2 h-8 w-40" />
          ) : (
            <p className="money mt-1 text-3xl text-ink-900">{formatCurrency(balance)}</p>
          )}
        </Card>

        <Card>
          <CardHeader title={isWithdraw ? 'Withdrawal amount' : 'Deposit amount'} />
          <form onSubmit={onReview} className="space-y-4" noValidate>
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
                setError(null);
              }}
              error={error}
            />

            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(String(value));
                    setError(null);
                  }}
                  className="rounded-xl bg-surface-alt px-3.5 py-2 text-xs font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  ₹{value.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <Input
              label="Description (optional)"
              placeholder={isWithdraw ? 'Cash for rent' : 'Salary'}
              maxLength={200}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            {numericAmount > 0 && balance !== null && (
              <div className="rounded-xl bg-surface-alt p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-500">Balance after</span>
                  <span
                    className={`money ${projected < 0 ? 'text-state-danger' : 'text-ink-900'}`}
                  >
                    {formatCurrency(projected)}
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={balance === null || Boolean(validate())}
            >
              Review {isWithdraw ? 'withdrawal' : 'deposit'}
            </Button>
          </form>
        </Card>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Confirm ${isWithdraw ? 'withdrawal' : 'deposit'}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onConfirm} loading={submitting}>
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl bg-surface-alt p-4 text-center">
            <p className="money text-2xl text-ink-900">{formatCurrency(numericAmount)}</p>
            <p className="mt-1 text-xs text-ink-500">
              {isWithdraw ? 'will be debited from' : 'will be credited to'} your account
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Balance after</span>
            <span className="money">{formatCurrency(projected)}</span>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

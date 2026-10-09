import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthShell from '../../components/layout/AuthShell';
import { formatCurrency } from '../../utils/formatters';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';

/** Shown once, immediately after registering — this is where the UPI ID is first revealed. */
function SuccessPanel({ account }) {
  const copy = (value) => navigator.clipboard?.writeText(value).catch(() => {});

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-brand-800">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
          <CheckCircle2 size={21} />
        </span>
        <p className="text-sm leading-5">Save these details. Your UPI ID is permanent.</p>
      </div>

      <dl className="space-y-3">
        {[
          ['Account number', account.accountNumber],
          ['UPI ID', account.upiId],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt p-4">
            <div className="min-w-0">
              <dt className="text-xs text-ink-500">{label}</dt>
              <dd className="truncate font-display text-sm font-semibold tabular-nums text-ink-900">
                {value}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => copy(value)}
              aria-label={`Copy ${label}`}
              className="rounded-lg p-2 text-ink-500 hover:bg-white"
            >
              <Copy size={15} />
            </button>
          </div>
        ))}
        <div className="rounded-xl bg-brand-50 p-4">
          <dt className="text-xs text-brand-700/80">Opening balance</dt>
          <dd className="money text-xl text-brand-800">{formatCurrency(account.balance)}</dd>
        </div>
      </dl>

      <Link to="/login" className="mt-6 block">
        <Button className="w-full" size="lg">
          Continue to sign in
        </Button>
      </Link>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [key]: null }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBanner('');

    // These mirror the backend rules; the server validates again regardless.
    const errors = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword:
        form.confirmPassword !== form.password ? 'Passwords do not match' : null,
    };
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const account = await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setCreated(account);
    } catch (error) {
      setBanner(error.message);
      setFieldErrors(error.errors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow={created ? 'Account ready' : 'Start with OBS'}
      title={created ? 'Account created' : 'Open your OBS account'}
      subtitle={created
        ? 'Your new account is ready. Keep these details handy for your first sign in.'
        : 'An account number, UPI ID, and opening balance are issued instantly.'}
    >
      {created ? (
        <SuccessPanel account={created} />
      ) : (
        <>
          {banner && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-state-danger"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{banner}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Username"
              placeholder="sidharth"
              autoComplete="username"
              value={form.username}
              onChange={update('username')}
              error={fieldErrors.username}
              hint="3–20 characters. Becomes your UPI handle."
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@mail.com"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              error={fieldErrors.password}
              hint="At least 8 characters, with a letter and a digit."
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={fieldErrors.confirmPassword}
            />
            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:text-brand-600">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

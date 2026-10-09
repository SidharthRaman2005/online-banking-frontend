import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthShell from '../../components/layout/AuthShell';
import { validateEmail } from '../../utils/validators';
import api from '../../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState(location.state?.notice ?? '');
  const [showActivationForm, setShowActivationForm] = useState(false);
  const [activationMessage, setActivationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [key]: null }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBanner('');

    const errors = {
      email: validateEmail(form.email),
      password: form.password ? null : 'Password is required',
    };
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      const fallback = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(fallback, { replace: true });
    } catch (error) {
      setBanner(error.message);
      setFieldErrors(error.errors ?? {});
      if (error.errorCode === 'ACCOUNT_DEACTIVATED') {
        setShowActivationForm(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitActivationRequest = async () => {
    if (!activationMessage.trim()) return;
    try {
      await api.post('/activation-requests', {
        email: form.email.trim(),
        password: form.password,
        message: activationMessage.trim(),
      });

      const confirmed = window.confirm('Activation request submitted — admin will review it.');
      if (confirmed) {
        window.location.reload();
      }
      setShowActivationForm(false);
      setActivationMessage('');
    } catch (err) {
      setBanner(err.message || 'Failed to submit request');
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to OBS"
      subtitle="Access your dashboard and keep every part of your banking in view."
    >
          {banner && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-state-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{banner}</span>
            </div>
          )}

          {showActivationForm && (
            <div className="mb-4 rounded-md border p-3">
              <div className="text-sm font-medium">Request re-activation</div>
              <textarea
                className="mt-2 w-full rounded border p-2 text-sm"
                rows={3}
                placeholder="Explain why your account should be re-activated"
                value={activationMessage}
                onChange={(e) => setActivationMessage(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={submitActivationRequest}>
                  Submit request
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowActivationForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@mail.com"
              value={form.email}
              onChange={update('email')}
              error={fieldErrors.email}
              prefix={<Mail size={14} />}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              error={fieldErrors.password}
              prefix={<Lock size={14} />}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input type="checkbox" className="h-4 w-4 rounded border-surface" />
                Remember me
              </label>
              <Link to="/forgot" className="text-sm text-brand-700 hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New here?{' '}
            <Link to="/register" className="font-medium text-brand-700 hover:text-brand-600">
              Create an account
            </Link>
          </p>
    </AuthShell>
  );
}

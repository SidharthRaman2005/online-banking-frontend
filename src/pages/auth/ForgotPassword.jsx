import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock, Mail } from 'lucide-react';
import AuthShell from '../../components/layout/AuthShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { validateEmail, validatePassword } from '../../utils/validators';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: null }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBanner('');
    const nextErrors = {
      email: validateEmail(form.email),
      newPassword: validatePassword(form.newPassword),
      confirmPassword: form.confirmPassword !== form.newPassword ? 'Passwords do not match' : null,
    };
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        email: form.email.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setComplete(true);
    } catch (error) {
      setBanner(error.message || 'Unable to reset password');
      setErrors(error.errors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title={complete ? 'Password updated' : 'Reset your password'}
      subtitle={complete
        ? 'Your new password is ready. Sign in to continue to your account.'
        : 'Enter your registered email and choose a new password for your OBS account.'}
    >
      {complete ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-brand-800">
            <CheckCircle2 className="mt-0.5 shrink-0 text-brand-600" size={20} />
            <p className="text-sm leading-5">Your password has been updated successfully.</p>
          </div>
          <Button type="button" className="w-full" size="lg" onClick={() => navigate('/login')}>
            Continue to sign in
          </Button>
        </div>
      ) : (
        <>
          {banner && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-state-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{banner}</span>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Registered email"
              type="email"
              autoComplete="email"
              placeholder="you@mail.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              prefix={<Mail size={14} />}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={update('newPassword')}
              error={errors.newPassword}
              hint="At least 8 characters, with a letter and a digit."
              prefix={<Lock size={14} />}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              prefix={<Lock size={14} />}
            />
            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Reset password
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-500">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:text-brand-600">Sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

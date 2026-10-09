import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Copy, Info } from 'lucide-react';
import Page from '../../components/layout/Page';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { ErrorState, SkeletonRows } from '../../components/ui/States';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { formatDateOnly } from '../../utils/formatters';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt p-4">
      <div className="min-w-0">
        <p className="text-xs text-ink-500">{label}</p>
        <p className="truncate font-display text-sm font-semibold tabular-nums text-ink-900">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="rounded-lg p-2 text-ink-500 transition hover:bg-white"
      >
        {copied ? <Check size={15} className="text-brand-600" /> : <Copy size={15} />}
      </button>
    </div>
  );
}

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [details, setDetails] = useState({ username: '', email: '' });
  const [detailErrors, setDetailErrors] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const load = async () => {
    setStatus('loading');
    try {
      const data = await userService.profile();
      setProfile(data);
      setDetails({ username: data.username, email: data.email });
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveDetails = async (event) => {
    event.preventDefault();
    const errors = {
      username: validateUsername(details.username),
      email: validateEmail(details.email),
    };
    setDetailErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingDetails(true);
    try {
      const updated = await userService.updateProfile({
        username: details.username.trim(),
        email: details.email.trim(),
      });
      setProfile(updated);
      updateUser({ username: updated.username, email: updated.email });
      toast.success('Profile updated');
    } catch (err) {
      setDetailErrors(err.errors ?? {});
      toast.error(err.message);
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    const errors = {
      currentPassword: passwords.currentPassword ? null : 'Current password is required',
      newPassword: validatePassword(passwords.newPassword),
      confirmPassword:
        passwords.confirmPassword !== passwords.newPassword ? 'Passwords do not match' : null,
    };
    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      setPasswordErrors(err.errors ?? { currentPassword: err.message });
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Page title="Profile" subtitle="Your account and personal details">
      {status === 'loading' && (
        <Card>
          <SkeletonRows rows={5} />
        </Card>
      )}
      {status === 'error' && (
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      )}

      {status === 'ready' && profile && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Account details"
              action={<StatusBadge status={profile.status} />}
            />
            <div className="space-y-3">
              <CopyField label="Account number" value={profile.accountNumber} />
              <CopyField label="UPI ID" value={profile.upiId} />
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt p-4">
                <div>
                  <p className="text-xs text-ink-500">Opened on</p>
                  <p className="text-sm font-medium text-ink-900">
                    {formatDateOnly(profile.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-ink-500">{profile.role}</span>
              </div>
              <p className="flex items-start gap-2 rounded-xl bg-accent-100/60 p-3 text-xs text-accent-600">
                <Info size={14} className="mt-0.5 shrink-0" />
                Your UPI ID is permanent. Changing your username does not change it, because other
                people may have saved it to pay you.
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Personal information" />
              <form onSubmit={saveDetails} className="space-y-4" noValidate>
                <Input
                  label="Username"
                  value={details.username}
                  onChange={(event) => {
                    setDetails((c) => ({ ...c, username: event.target.value }));
                    setDetailErrors((c) => ({ ...c, username: null }));
                  }}
                  error={detailErrors.username}
                />
                <Input
                  label="Email"
                  type="email"
                  value={details.email}
                  onChange={(event) => {
                    setDetails((c) => ({ ...c, email: event.target.value }));
                    setDetailErrors((c) => ({ ...c, email: null }));
                  }}
                  error={detailErrors.email}
                />
                <Button type="submit" loading={savingDetails}>
                  Save changes
                </Button>
              </form>
            </Card>

            <Card>
              <CardHeader title="Change password" />
              <form onSubmit={savePassword} className="space-y-4" noValidate>
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) => {
                    setPasswords((c) => ({ ...c, currentPassword: event.target.value }));
                    setPasswordErrors((c) => ({ ...c, currentPassword: null }));
                  }}
                  error={passwordErrors.currentPassword}
                />
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={(event) => {
                    setPasswords((c) => ({ ...c, newPassword: event.target.value }));
                    setPasswordErrors((c) => ({ ...c, newPassword: null }));
                  }}
                  error={passwordErrors.newPassword}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={(event) => {
                    setPasswords((c) => ({ ...c, confirmPassword: event.target.value }));
                    setPasswordErrors((c) => ({ ...c, confirmPassword: null }));
                  }}
                  error={passwordErrors.confirmPassword}
                />
                <Button type="submit" loading={savingPassword}>
                  Update password
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
}

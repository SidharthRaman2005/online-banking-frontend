import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-page p-6 text-center">
      <div>
        <p className="font-display text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-3 font-display text-xl font-semibold text-ink-900">Page not found</h1>
        <p className="mt-1 text-sm text-ink-500">
          That page does not exist, or you do not have access to it.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

/** Shared shell for both the user and admin areas; only the sidebar contents differ. */
export default function AppLayout({ variant = 'user' }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-page p-0 lg:p-6">
      <div className="flex min-h-screen overflow-hidden bg-white lg:min-h-[calc(100vh-3rem)] lg:rounded-3xl lg:shadow-float">
        <Sidebar variant={variant} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet context={{ onOpenMenu: () => setMenuOpen(true) }} />
        </div>
      </div>
    </div>
  );
}

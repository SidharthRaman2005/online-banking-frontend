import { useOutletContext } from 'react-router-dom';
import Topbar from './Topbar';

/** Wraps a route body with the topbar and the scrollable content column. */
export default function Page({ title, subtitle, children }) {
  const { onOpenMenu } = useOutletContext() ?? {};

  return (
    <>
      <Topbar title={title} subtitle={subtitle} onOpenMenu={onOpenMenu} />
      <main className="flex-1 overflow-y-auto bg-surface-page/60 p-5 lg:p-8">{children}</main>
    </>
  );
}

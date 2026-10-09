export default function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-page">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
        <p className="text-sm text-ink-500">Loading…</p>
      </div>
    </div>
  );
}

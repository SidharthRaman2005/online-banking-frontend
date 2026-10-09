import { Check, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-surface-page px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-float lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col">
          <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-accent-300/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 font-display text-lg font-bold shadow-lg shadow-brand-950/20">
              O
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">OBS<span className="text-brand-300">.</span></p>
              <p className="text-[11px] text-brand-100/70">Online Banking System</p>
            </div>
          </div>

          <div className="relative mt-auto max-w-md pb-5 pt-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-brand-100">
              <Sparkles size={13} className="text-accent-300" /> Banking made clear
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight">
              Your money,<br /><span className="text-brand-300">moving with purpose.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-brand-100/75">
              A calm, secure place to manage everyday banking, move funds, and keep your financial life in view.
            </p>
          </div>

          <div className="relative mt-auto flex justify-center">
            <div className="w-full max-w-[220px] rounded-2xl bg-brand-500 p-4 text-center text-brand-950 shadow-lg shadow-brand-950/20">
              <div className="mb-5 flex items-center justify-center gap-2 text-brand-950/70">
                <span className="text-[10px] uppercase tracking-[0.16em]">Protected</span>
                <ShieldCheck size={16} />
              </div>
              <p className="font-display text-2xl font-semibold">24/7</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-brand-950/70"><Check size={12} /> Secure access</p>
            </div>
          </div>
        </section>

        <section className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-12 sm:py-12 lg:px-16">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-display font-bold text-white">O</span>
              <span className="font-display text-lg font-bold text-ink-900">OBS<span className="text-brand-600">.</span></span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

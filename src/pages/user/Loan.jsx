import { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/ui/Button';

// Images removed — keep content-only layout for loans

export default function Loan() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/loans')
      .then((res) => {
        if (mounted) setInfo(res);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const apply = (loanType) => {
    // Show a lightweight in-page confirmation/instruction instead of navigating away
    setApplied(loanType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {applied && (
          <div className="mb-6 rounded-2xl bg-yellow-50 p-6 shadow">
            <h3 className="text-lg font-semibold">Next steps to apply for {applied}</h3>
            <p className="mt-2 text-sm text-ink-700">Thank you for your interest in {applied}. To proceed with your application, please visit your nearest official OBS branch or contact our customer service. A bank representative will guide you through documentation verification and formal loan processing.</p>
            <div className="mt-3">
              <Button variant="primary" onClick={() => setApplied(null)}>Close</Button>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-3xl font-semibold">Loans & Lending</h2>
          <p className="mt-3 text-sm text-ink-600">{info?.overview}. Our products are designed with transparency: clear fees, flexible tenures, and competitive rates. Below you'll find details for each product, eligibility checklist, required documents, and indicative rates to help you choose.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {info?.types?.map((t, idx) => (
            <div key={t} className="rounded-2xl bg-white p-5 shadow">
              <h3 className="text-lg font-medium">{t}</h3>
              <p className="mt-3 text-sm text-ink-600">{t} from OBS offers competitive pricing and flexible repayment. Typical use-cases: {t === 'Home Loan' ? 'buying property, balance transfer, renovation' : t === 'Personal Loan' ? 'short-term expenses, travel, medical' : t === 'Auto Loan' ? 'new or used vehicle purchase' : t === 'Education Loan' ? 'tuition and living expenses' : 'business expansion and working capital'}.</p>
              <p className="mt-2 text-sm text-ink-600">We review each application based on credit history, income documentation, and other risk factors. Processing times vary by product — please contact the branch for expected timelines and applicable fees.</p>
              <ul className="mt-3 list-inside list-disc text-sm text-ink-600">
                <li>Loan amount: subject to eligibility</li>
                <li>Tenure: up to 20 years (product dependent)</li>
                <li>Processing fee: as applicable</li>
              </ul>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-medium">Indicative rate: {info?.rates?.[idx]?.interest ?? 'See rates'}</div>
                <Button variant="primary" onClick={() => apply(t)}>Apply</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-lg font-medium">Eligibility</h4>
            <ul className="mt-3 list-inside list-disc text-sm text-ink-600">
              {info?.eligibility?.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h4 className="text-lg font-medium">Documents Required</h4>
            <ul className="mt-3 list-inside list-disc text-sm text-ink-600">
              {info?.documents?.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h4 className="text-lg font-medium">Interest Rates</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {info?.rates?.map((r) => (
              <div key={r.loanType} className="flex items-center justify-between rounded-lg bg-surface-alt p-3">
                <div className="text-sm text-ink-700">{r.loanType}</div>
                <div className="text-sm font-medium text-ink-900">{r.interest}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

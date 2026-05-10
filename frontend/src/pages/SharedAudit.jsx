import { useEffect, useState } from 'react';
import SummaryCard from '../components/SummaryCard.jsx';
import Results from '../components/Results.jsx';
import { fetchSharedAudit } from '../services/api.js';

export default function SharedAudit() {
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shareId = window.location.pathname.split('/').pop();

    if (!shareId) {
      setError('Missing audit link.');
      setLoading(false);
      return;
    }

    async function loadAudit() {
      try {
        const response = await fetchSharedAudit(shareId);
        setAuditData(response.audit);
      } catch (err) {
        setError(err.message || 'Unable to load shared audit.');
      } finally {
        setLoading(false);
      }
    }

    loadAudit();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.24em] text-teal-300">Loading shared audit</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Hang tight...</h1>
          <p className="mt-3 text-slate-300">Fetching public audit results for your link.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-600/40 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/30">
          <p className="text-sm uppercase tracking-[0.24em] text-rose-300">Link error</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Unable to load audit</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-600">Shared audit</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Public AI spend audit</h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            This version is stripped of identifying details and shows tool-level savings and recommendations only.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Overview</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                Team size: {auditData?.input?.teamSize || 'N/A'} · Use case: {auditData?.input?.primaryUseCase || 'N/A'}
              </p>
            </div>

            <Results
              audit={auditData}
              saveStatus=""
              aiStatus=""
              onCapture={() => {} }
              onGenerateExplanation={() => {} }
              showCaptureButton={false}
              showGenerateButton={false}
            />
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Share this link</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                Copy or share the public audit URL to highlight savings and move conversations forward.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <span className="font-semibold">{window.location.href}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

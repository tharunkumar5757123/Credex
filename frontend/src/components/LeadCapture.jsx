import { useState } from 'react';
import { saveLead } from '../services/api.js';

export default function LeadCapture({ isOpen, onClose, audit, shareId, teamSize }) {
  const [form, setForm] = useState({
    email: '',
    company: '',
    role: '',
    website: '',
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submitLead = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setStatus('Saving...');

    try {
      await saveLead({
        ...form,
        teamSize,
        auditShareId: shareId,
        totalMonthlySavings: audit?.totalMonthlySavings || 0,
      });

      setStatus('Saved successfully. Check your inbox if email is enabled.');

      // reset form after success
      setForm({
        email: '',
        company: '',
        role: '',
        website: '',
      });
    } catch (error) {
      setStatus(error.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-8 backdrop-blur-md">
      <div className="w-full max-w-md animate-scale-in rounded-lg border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-8">

        <p className="eyebrow">Export report</p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Send audit
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Get the audit link and let Credex follow up if the savings case is strong.
        </p>

        {shareId && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Public report:{' '}
            <span className="font-semibold">/audit/{shareId}</span>
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={submitLead}>
          
          {/* Honeypot field (bot trap) */}
          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="field-shell"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Company
            <input
              value={form.company}
              onChange={(e) =>
                setForm({ ...form, company: e.target.value })
              }
              className="field-shell"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Role
            <input
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
              className="field-shell"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/70 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Audit'}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-sm text-slate-600">{status}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import SpendForm from '../components/SpendForm.jsx';
import Results from '../components/Results.jsx';
import LeadCapture from '../components/LeadCapture.jsx';
import { initialForm } from '../initialState.js';
import { pricingData } from '../utils/pricingData.js';
import { runAudit } from '../utils/auditEngine.js';
import { explainAudit, saveAudit } from '../services/api.js';

export default function Home() {
  const [input, setInput] = useState(() => {
    const stored = window.localStorage.getItem('credex-audit-input');
    return stored ? JSON.parse(stored) : initialForm;
  });

  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [savedAudit, setSavedAudit] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiStatus, setAiStatus] = useState('');

  useEffect(() => {
    window.localStorage.setItem('credex-audit-input', JSON.stringify(input));
  }, [input]);

  const audit = useMemo(() => runAudit(input, pricingData), [input]);

  const displayAudit = useMemo(
    () => (aiExplanation ? { ...audit, aiExplanation } : audit),
    [audit, aiExplanation]
  );

  useEffect(() => {
    setAiExplanation(null);
    setAiStatus('');
  }, [input]);

  // ✅ UPDATE TOOL
  const updateTool = (index, field, value) => {
    setInput((prev) => {
      const next = { ...prev, tools: [...prev.tools] };

      if (field === 'replace') {
        next.tools[index] = value;
        return next;
      }

      const tool = { ...next.tools[index] };

      if (field === 'monthlySpend' || field === 'seats') {
        tool[field] = Number(value);
      } else {
        tool[field] = value;
      }

      next.tools[index] = tool;
      return next;
    });
  };

  // ✅ ADD TOOL
  const addTool = () => {
    setInput((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          id: 'openai',
          plan: 'API direct',
          seats: 0,
          monthlySpend: 100,
        },
      ],
    }));
  };

  // 🔥 FIXED: DELETE TOOL (MISSING EARLIER)
  const deleteTool = (id) => {
  setInput((prev) => ({
    ...prev,
    tools: prev.tools.filter((tool) => tool.id !== id),
  }));
};

  // 💾 SAVE REPORT
  const captureReport = async () => {
    setSaveStatus('Saving report...');
    try {
      const response = await saveAudit(input, displayAudit);
      setSavedAudit(response.audit);
      setIsCaptureOpen(true);
      setSaveStatus('');
    } catch (error) {
      setSavedAudit(null);
      setIsCaptureOpen(true);
      setSaveStatus(
        'MongoDB save failed. You can still capture the lead locally.'
      );
    }
  };

  // 🤖 AI EXPLANATION
  const generateExplanation = async () => {
    setAiStatus('Generating with Hugging Face...');
    try {
      const response = await explainAudit(input, audit);
      setAiExplanation(response.aiExplanation);

      setAiStatus(
        response.aiExplanation.provider === 'huggingface'
          ? 'Generated with Hugging Face.'
          : 'Generated with deterministic fallback.'
      );
    } catch (error) {
      setAiStatus(error.message);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden text-slate-900 antialiased">
      <div className="pointer-events-none fixed inset-0 opacity-[0.45] [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-36 bg-gradient-to-b from-white/80 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 grid gap-5 border-b border-slate-900/10 pb-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_18px_rgba(20,184,166,0.8)]" />
              Credex AI audit
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              AI spend control room for lean teams
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Model your AI stack, pressure-test seats and plans, and surface
              savings opportunities as the numbers change.
            </p>
          </div>

          <div className="animate-fade-up rounded-lg border border-white/70 bg-slate-950 px-5 py-4 text-white shadow-glow [animation-delay:120ms]">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Live estimate
            </p>
            <p className="mt-2 text-3xl font-semibold">
              ${audit.totalMonthlySavings.toFixed(0)}
            </p>
            <p className="text-sm text-slate-300">monthly opportunity</p>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr] lg:items-start">
          <SpendForm
            input={input}
            setInput={setInput}
            updateTool={updateTool}
            addTool={addTool}
            deleteTool={deleteTool}   // ✅ FIX ADDED HERE
          />

          <Results
            audit={displayAudit}
            saveStatus={saveStatus}
            aiStatus={aiStatus}
            onCapture={captureReport}
            onGenerateExplanation={generateExplanation}
          />
        </main>
      </div>

      <LeadCapture
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        audit={savedAudit?.audit || displayAudit}
        shareId={savedAudit?.shareId}
        teamSize={input.teamSize}
      />
    </div>
  );
}
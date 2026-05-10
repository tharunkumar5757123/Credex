import SummaryCard from './SummaryCard.jsx';

const toolTypeLabels = {
  api: 'API usage tool',
  flat: 'Flat-price tool',
  seat: 'Seat-based tool',
};

export default function Results({ audit, saveStatus, aiStatus, onCapture, onGenerateExplanation }) {
  const insight =
    audit.totalMonthlySavings >= 500
      ? 'Credex can help capture more of this through discounted AI credits.'
      : audit.totalMonthlySavings < 100
        ? "You're spending well. Keep a watchlist for future optimizations."
        : 'There is useful savings potential without a full stack migration.';

  return (
    <section className="premium-panel animate-fade-up p-5 [animation-delay:90ms] sm:p-6 lg:sticky lg:top-6 lg:p-7">
      <div className="mb-8">
        <p className="eyebrow">Audit result</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Savings snapshot</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Recommendations refresh as your stack changes.
        </p>
      </div>

      <SummaryCard
        totalCurrentMonthly={audit.totalCurrentMonthly}
        totalOptimizedMonthly={audit.totalOptimizedMonthly}
        totalMonthlySavings={audit.totalMonthlySavings}
        totalAnnualSavings={audit.totalAnnualSavings}
      />
      <p className="mb-5 rounded-lg border border-teal-200/80 bg-teal-50/80 px-4 py-3 text-sm font-medium leading-6 text-teal-950 shadow-inner-soft">
        {insight}
      </p>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white/80 px-4 py-4 shadow-inner-soft">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Audit methodology</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          <li>Reported spend is treated as the financial truth.</li>
          <li>Benchmark pricing comes from PRICING_DATA.md and is used to calculate ideal plan cost.</li>
          <li>Savings are only shown when reported spend is above a lower-cost equivalent.</li>
          <li>API tools and seat-based tools are evaluated separately.</li>
        </ul>
      </div>
      <p className="mb-6 text-sm leading-6 text-slate-700">{audit.summary}</p>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white/80 px-4 py-4 shadow-inner-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">AI explanation</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {audit.aiExplanation?.narrative || 'Generate a plain-English executive summary with Hugging Face.'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            onClick={onGenerateExplanation}
          >
            Generate
          </button>
        </div>
        {audit.aiExplanation ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Provider: {audit.aiExplanation.provider} - Status: {audit.aiExplanation.status}
          </p>
        ) : null}
        {aiStatus ? <p className="mt-3 text-sm text-slate-500">{aiStatus}</p> : null}
      </div>

      <div className="space-y-4">
        {audit.results.map((item, index) => (
          <article
            key={item.toolId}
            className="motion-card rounded-lg border border-slate-200/80 bg-white/80 p-5 shadow-sm shadow-slate-200/60"
            style={{ animationDelay: `${140 + index * 70}ms` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold capitalize text-slate-950">{item.toolId}</h3>
                <p className="text-sm text-slate-500">
                  {toolTypeLabels[item.toolType] || 'Pricing tool'} - Pricing source: {item.source}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  {item.confidence.label}
                </p>
                {item.needsVerification ? (
                  <p className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
                    Needs verification
                  </p>
                ) : null}
                <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
                  ${item.potentialSavings.toFixed(0)} saved
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">User reported spend</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {item.currentPlan.toolName} {item.currentPlan.planName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.currentPlan.formula}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Benchmark price
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Rule-based baseline
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.benchmarkPlan.formula}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {item.benchmarkAvailable ? `$${item.benchmarkSpend.toFixed(0)}/month` : 'No seat benchmark'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Recommendation</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{item.recommendation}</p>
                <p className="mt-1 text-sm text-slate-600">{item.targetPlan.formula}</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Savings math</p>
              <p className="mt-2 text-sm font-semibold text-emerald-950">{item.calculation}</p>
              <p className="mt-1 text-sm text-emerald-800">
                After optimization: ${item.recommendedSpend.toFixed(0)}/month
              </p>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Confidence</p>
                <p className="text-sm font-semibold text-slate-950">{item.confidence.score}/100</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500"
                  style={{ width: `${item.confidence.score}%` }}
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.confidence.rationale}</p>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                <p>Pricing {item.confidence.components.pricingMatch.score}/100</p>
                <p>Usage {item.confidence.components.usageCorrectness.score}/100</p>
                <p>Mapping {item.confidence.components.mappingCorrectness.score}/100</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-700">{item.reason}</p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Confidence reasons</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {item.confidenceReasons.map((confidenceReason) => (
                  <li key={confidenceReason}>{confidenceReason}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/70 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200"
        onClick={onCapture}
      >
        Export Report
      </button>
      {saveStatus ? <p className="mt-3 text-sm text-slate-500">{saveStatus}</p> : null}
    </section>
  );
}

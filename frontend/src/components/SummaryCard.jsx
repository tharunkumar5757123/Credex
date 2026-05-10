export default function SummaryCard({
  totalCurrentMonthly = 0,
  totalOptimizedMonthly = 0,
  totalMonthlySavings = 0,
  totalAnnualSavings = 0,
}) {
  return (
    <div className="relative mb-7 overflow-hidden rounded-lg bg-slate-950 px-6 py-7 text-white shadow-glow">
      
      {/* top glow line */}
      <div className="absolute inset-x-0 top-0 h-px animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(45,212,191,0.9),rgba(250,204,21,0.85),transparent)] bg-[length:200%_100%]" />
      
      {/* decoration */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-teal-300/20" />

      <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-200">
        Before vs after
      </p>

      {/* values */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Before
          </p>
          <p className="mt-1 text-2xl font-semibold">
            ${Number(totalCurrentMonthly).toFixed(0)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            After
          </p>
          <p className="mt-1 text-2xl font-semibold">
            ${Number(totalOptimizedMonthly).toFixed(0)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Savings
          </p>
          <p className="mt-1 text-2xl font-semibold text-teal-100">
            ${Number(totalMonthlySavings).toFixed(0)}
          </p>
        </div>
      </div>

      {/* big number */}
      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-white/10 pt-5">
        <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
          ${Number(totalMonthlySavings).toFixed(0)}
        </p>
        <span className="pb-2 text-sm text-slate-300">/ month</span>
      </div>

      {/* annual */}
      <p className="mt-3 text-sm text-slate-300">
        Estimated annual potential savings: $
        {Number(totalAnnualSavings).toFixed(0)}.
      </p>
    </div>
  );
}
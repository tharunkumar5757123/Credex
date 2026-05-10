import { toolOptions } from '../utils/pricingData.js';

export default function ToolInput({ tool, index, updateTool, deleteTool }) {
  const selectedTool =
    toolOptions.find((option) => option.id === tool.id) || toolOptions[0];

  const selectedPlanType =
    selectedTool.planTypes[tool.plan] || 'seat';

  const isApiTool = selectedPlanType === 'api';
  const isFlatTool = selectedPlanType === 'flat';

  const seatCount = Math.max(1, Number(tool.seats || 1));

  return (
    <div className="motion-card rounded-lg border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-sm shadow-slate-200/70">
      
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            {tool.id}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {tool.plan}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-md">
            {index + 1}
          </div>

          {/* ❌ DELETE BUTTON ADDED */}
         <button
  type="button"
  onClick={() => deleteTool(tool.id)}
  className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 transition"
>
  Delete
</button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {/* TOOL SELECT */}
        <label className="label-copy">
          Tool
          <select
            value={tool.id}
            onChange={(e) => {
              const nextTool = toolOptions.find(
                (option) => option.id === e.target.value
              );
              const nextPlan = nextTool.plans[0];

              updateTool(index, 'replace', {
                ...tool,
                id: e.target.value,
                plan: nextPlan,
                seats:
                  nextTool.planTypes[nextPlan] === 'seat'
                    ? Math.max(1, Number(tool.seats || 1))
                    : 0,
              });
            }}
            className="field-shell"
          >
            {toolOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        {/* PLAN SELECT */}
        <label className="label-copy">
          Plan
          <select
            value={tool.plan}
            onChange={(e) => {
              const nextPlan = e.target.value;

              updateTool(index, 'replace', {
                ...tool,
                plan: nextPlan,
                seats:
                  selectedTool.planTypes[nextPlan] === 'seat'
                    ? Math.max(1, Number(tool.seats || 1))
                    : 0,
              });
            }}
            className="field-shell"
          >
            {selectedTool.plans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </label>

        {/* BILLING INFO */}
        {isApiTool || isFlatTool ? (
          <div className="rounded-lg border border-slate-200 bg-white/75 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Billing basis
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {isApiTool ? 'Usage spend' : 'Flat plan'}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {isApiTool
                ? 'API tools ignore seats; monthly spend drives the math.'
                : 'This plan uses a fixed benchmark, not seat multiplication.'}
            </p>
          </div>
        ) : (
          <label className="label-copy">
            What-if seats
            <input
              type="range"
              min={1}
              max={100}
              value={seatCount}
              onChange={(e) => updateTool(index, 'seats', e.target.value)}
              className="h-11 accent-teal-600"
            />
            <input
              type="number"
              min={1}
              value={seatCount}
              onChange={(e) => updateTool(index, 'seats', e.target.value)}
              className="field-shell"
            />
          </label>
        )}

        {/* MONTHLY SPEND */}
        <label className="label-copy border border-slate-200 bg-white/75 px-4 py-3">
          Monthly spend
          <input
            type="number"
            min={0}
            value={tool.monthlySpend}
            onChange={(e) => updateTool(index, 'monthlySpend', e.target.value)}
            className="field-shell mt-2 size-20"
          />
        </label>
      </div>
    </div>
  );
}
import ToolInput from './ToolInput.jsx';

export default function SpendForm({
  input,
  setInput,
  updateTool,
  addTool,
  deleteTool,
}) {
  return (
    <section className="premium-panel animate-fade-up p-5 sm:p-6 lg:p-7">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Stack inputs</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Spend model
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Changes are saved locally and recalculated instantly.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-right shadow-inner-soft">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Tools
          </p>
          <p className="text-2xl font-semibold text-slate-950">
            {input.tools.length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="label-copy">
          Team size
          <input
            type="number"
            min={1}
            value={input.teamSize}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                teamSize: Number(e.target.value),
              }))
            }
            className="field-shell"
          />
        </label>

        <label className="label-copy">
          Primary use case
          <select
            value={input.primaryUseCase}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                primaryUseCase: e.target.value,
              }))
            }
            className="field-shell"
          >
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="data">Data</option>
            <option value="research">Research</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
      </div>

      {/* TOOL LIST */}
      <div className="mt-8 space-y-4">
        {input.tools.map((tool, index) => (
          <ToolInput
            key={tool.id + '-' + index}
            tool={tool}
            index={index}
            updateTool={updateTool}
            deleteTool={deleteTool}
          />
        ))}
      </div>

      {/* ADD BUTTON */}
      <button
        type="button"
        className="group mt-6 inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/60 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200"
        onClick={addTool}
      >
        <span className="mr-2 text-lg leading-none transition group-hover:rotate-90">
          +
        </span>
        Add tool
      </button>
    </section>
  );
}
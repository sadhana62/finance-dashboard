export default function Dashboard() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">
          Intelligence Intelligence
        </p>
        <h2 className="mt-3 text-5xl font-semibold tracking-tight">
          Financial Velocity
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-[var(--text-secondary)]">
          Your capital flow is optimizing. We’ve identified key shifts in your
          monthly spending architecture.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard
            title="Highest Spending Category"
            value="Dining Out"
            subValue="$1,200 this period"
          />
          <GlassCard
            title="Monthly Comparison"
            value="Savings Yield"
            subValue="+15% more than last month"
          />
        </div>

        <div className="flex items-start justify-end gap-4">
          <ActionButton label="Export Report" secondary />
          <ActionButton label="Plan Future Flow" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <Panel title="Income vs. Expenses" className="h-[420px]" />
        <Panel title="Top Merchants" className="h-[420px]" />
      </div>

      <Panel className="min-h-[320px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              AI-Powered Projection
            </p>
            <h3 className="mt-5 text-5xl font-semibold tracking-tight">
              Redefine your 2024 tax strategy.
            </h3>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              Based on your current velocity, you're on track for a 12% surplus.
              Our intelligence recommends shifting $4,500 to your high-yield ledger.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <ActionButton label="Run Simulation" />
              <ActionButton label="Learn More" secondary />
            </div>
          </div>

          <div
            className="min-h-[260px] rounded-[2rem] border"
            style={{
              background:
                "radial-gradient(circle at center, rgba(91,140,255,0.35), transparent 55%), var(--bg-elevated)",
              borderColor: "var(--card-border)",
            }}
          />
        </div>
      </Panel>
    </section>
  );
}

function GlassCard({ title, value, subValue }) {
  return (
    <div
      className="rounded-[2rem] border p-7"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
        backdropFilter: "blur(18px)",
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <h3 className="mt-4 text-4xl font-semibold tracking-tight">{value}</h3>
      <p className="mt-6 text-lg font-medium text-[var(--accent)]">{subValue}</p>
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-[2rem] border p-7 ${className}`}
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
        backdropFilter: "blur(18px)",
      }}
    >
      {title && <h3 className="text-2xl font-semibold">{title}</h3>}
      {children}
    </div>
  );
}

function ActionButton({ label, secondary = false }) {
  return (
    <button
      className="rounded-2xl px-6 py-4 text-sm font-semibold transition"
      style={{
        background: secondary ? "var(--bg-elevated)" : "var(--accent)",
        color: secondary ? "var(--text-primary)" : "#08111f",
        border: secondary ? `1px solid var(--card-border)` : "none",
        boxShadow: "var(--shadow)",
      }}
    >
      {label}
    </button>
  );
}
import { useEffect } from "react";
import {
  BarChart3,
  CalendarClock,
  Lightbulb,
  ReceiptText,
  TrendingUp,
  WalletCards,
  PieChart,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  selectFinanceStatus,
  selectInsightsData,
  selectTransactions,
} from "../store/financeSlice";
import { formatAmount } from "../utils/formatters";

export default function Insights() {
  const status = useSelector(selectFinanceStatus);
  const transactions = useSelector(selectTransactions);
  const insights = useSelector(selectInsightsData);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (status === "loading" && transactions.length === 0) {
    return <LoadingState />;
  }

  if (transactions.length === 0) {
    return (
      <section className="space-y-6">
        <PageIntro />
        <EmptyState
          title="No transaction data yet"
          detail="Add a few transactions and this page will highlight useful spending patterns and comparisons."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageIntro />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={WalletCards}
          eyebrow="Highest spending category"
          title={insights.topCategory.title}
          detail={insights.topCategory.detail}
        />
        <InsightCard
          icon={BarChart3}
          eyebrow="Monthly comparison"
          title={insights.monthlyComparison.title}
          detail={insights.monthlyComparison.detail}
        />
        <InsightCard
          icon={Lightbulb}
          eyebrow="Useful observation"
          title={insights.observation.title}
          detail={insights.observation.detail}
        />
        <InsightCard
          icon={PieChart}
          eyebrow="Spending Concentration"
          title={insights.categoryCorrelation.title}
          detail={insights.categoryCorrelation.detail}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Where you can cut back
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                A practical place to start if you want to reduce spending next month.
              </p>
            </div>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <ReceiptText size={20} />
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            <InsightStrip
              label="Focus area"
              title={insights.savingsTip.title}
              detail={insights.savingsTip.detail}
            />
            <InsightStrip
              label="Previous period"
              title={insights.previousDateInsight.title}
              detail={insights.previousDateInsight.detail}
            />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Quick ideas to reduce expenses
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Small changes that usually create savings without feeling too restrictive.
              </p>
            </div>
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <CalendarClock size={20} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <TipCard
              title="Set one dining budget for the week"
              detail="A simple weekly cap makes restaurant and delivery costs easier to control before they stack up."
            />
            <TipCard
              title="Review recurring utility plans"
              detail="Internet, electricity, and subscriptions are often the easiest fixed costs to optimize quietly."
            />
            <TipCard
              title="Compare this month against the previous one"
              detail="Spotting a category that suddenly jumps is usually the fastest way to find avoidable expenses."
            />
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Spending distribution
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              See which categories are taking the largest share of your expenses.
            </p>
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <TrendingUp size={20} />
          </div>
        </div>

        {insights.categoryBreakdown.length > 0 ? (
          <div className="mt-8 space-y-4">
            {insights.categoryBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-medium">{formatAmount(item.amount)}</span>
                </div>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {item.percent}% of total expenses
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    Category share
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full"
                  style={{ background: "var(--bg-soft)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percent}%`,
                      background:
                        "linear-gradient(90deg, var(--accent), rgba(20, 184, 166, 0.82))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No expense categories available"
            detail="Add expense entries to see a category-wise distribution here."
            compact
          />
        )}
      </Panel>
    </section>
  );
}

function PageIntro() {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
        Insights
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight">
        Signals worth watching
      </h2>
      <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
        Helpful observations based on your recent income and spending activity.
      </p>
    </div>
  );
}

function InsightCard({ icon: Icon, eyebrow, title, detail }) {
  return (
    <Panel>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Icon size={20} />
      </div>
      <p className="mt-5 text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {detail}
      </p>
    </Panel>
  );
}

function InsightStrip({ label, title, detail }) {
  return (
    <div
      className="rounded-[1.6rem] border p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">{label}</p>
      <p className="mt-3 text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

function TipCard({ title, detail }) {
  return (
    <div
      className="rounded-[1.5rem] border p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

function EmptyState({ title, detail, compact = false }) {
  return (
    <Panel>
      <div className={compact ? "" : "py-6"}>
        <p className="text-xl font-semibold tracking-tight">{title}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          {detail}
        </p>
      </div>
    </Panel>
  );
}

function LoadingState() {
  return (
    <section
      className="rounded-[2rem] border p-8 transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
        Insights
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">
        Loading your insights...
      </h2>
    </section>
  );
}

function Panel({ children }) {
  return (
    <div
      className="rounded-[2rem] border p-6 transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
        backdropFilter: "blur(18px)",
      }}
    >
      {children}
    </div>
  );
}

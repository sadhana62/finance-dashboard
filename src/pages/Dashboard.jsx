import { useState, useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import {
  selectDashboardData,
  selectFinanceStatus,
  selectTransactions,
} from "../store/financeSlice";
import { formatAmount } from "../utils/formatters";

const cardIcons = {
  balance: Wallet,
  income: ArrowUpRight,
  expense: ArrowDownRight,
  savings: PiggyBank,
};

const ringColors = ["#2563eb", "#14b8a6", "#f59e0b", "#fb7185", "#8b5cf6"];

export default function Dashboard() {
  const status = useSelector(selectFinanceStatus);
  const transactions = useSelector(selectTransactions);
  const dashboard = useSelector(selectDashboardData);
  const analytics = buildDashboardAnalytics(transactions, dashboard.spendingBreakdown);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (status === "loading" && transactions.length === 0) {
    return <LoadingState />;
  }

  if (transactions.length === 0) {
    return (
      <section className="space-y-6">
        <EmptyPanel
          title="No dashboard data available"
          detail="Add a few records to see your financial overview here."
        />
      </section>
    );
  }

  const summaryCards = [
    {
      key: "balance",
      title: "Total Balance",
      value: formatAmount(dashboard.totalBalance),
      detail: "latest trend point",
      tone: "positive",
    },
    {
      key: "income",
      title: "Income",
      value: formatAmount(dashboard.currentIncome),
      detail: "current month",
      tone: "positive",
    },
    {
      key: "expense",
      title: "Expenses",
      value: formatAmount(dashboard.currentExpense),
      detail: "current month",
      tone: "neutral",
    },
    {
      key: "savings",
      title: "Saved This Month",
      value: formatAmount(dashboard.netSavings),
      detail: `${dashboard.savingsRate}% savings rate`,
      tone: dashboard.netSavings >= 0 ? "positive" : "neutral",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <HeroPanel dashboard={dashboard} />
        <HighlightsPanel dashboard={dashboard} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.key}
            icon={cardIcons[card.key]}
            title={card.title}
            value={card.value}
            detail={card.detail}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="grid gap-6">
        <TrendPanel analytics={analytics} />
        <BreakdownPanel dashboard={dashboard} analytics={analytics} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CashFlowPanel dashboard={dashboard} />
        <SnapshotPanel dashboard={dashboard} />
      </div>
    </section>
  );
}

function HeroPanel({ dashboard }) {
  const isPositive = dashboard.netSavings >= 0;
  const titleText = isPositive
    ? "Your financial health is looking strong this month."
    : "Your finances might need a little attention.";
  const descriptionText = isPositive
    ? `Great job! You have a positive net cash flow of ${formatAmount(dashboard.netSavings)}. Your largest expense is ${dashboard.highestCategory}, keeping your estimated runway at ${dashboard.forecastRunway}.`
    : `Your net cash flow is currently ${formatAmount(dashboard.netSavings)}. Consider reviewing your spending on ${dashboard.highestCategory} to help extend your ${dashboard.forecastRunway} runway.`;

  return (
    <Panel className="h-full overflow-hidden">
      <div className="relative h-full">
        <div
          className="absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl"
          style={{ background: "rgba(91, 140, 255, 0.18)" }}
        />
        <div
          className="absolute bottom-0 right-20 h-28 w-28 rounded-full blur-3xl"
          style={{ background: "rgba(20, 184, 166, 0.12)" }}
        />

        <div className="relative flex h-full flex-col justify-between gap-5">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
              Dashboard Overview
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
              {titleText}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
              {descriptionText}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricChip label="Net Cash Flow" value={formatAmount(dashboard.netSavings)} />
            <MetricChip label="Largest Spend" value={dashboard.highestCategory} />
            <MetricChip label="Forecast Runway" value={dashboard.forecastRunway} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function HighlightsPanel({ dashboard }) {
  return (
    <Panel className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
            This Month
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            {dashboard.comparisonTitle}
          </h3>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{
            background:
              dashboard.healthLabel === "Healthy"
                ? "rgba(52, 211, 153, 0.12)"
                : "rgba(245, 158, 11, 0.14)",
            color:
              dashboard.healthLabel === "Healthy"
                ? "var(--success)"
                : "var(--warning)",
          }}
        >
          {dashboard.healthLabel}
        </span>
      </div>

      <div className="mt-8 space-y-5">
        <ProgressRow
          label="Budget Used"
          value={`${dashboard.goals.budgetUsed}%`}
          width={`${dashboard.goals.budgetUsed}%`}
        />
        <ProgressRow
          label="Savings Goal"
          value={`${dashboard.goals.savingsGoal}%`}
          width={`${dashboard.goals.savingsGoal}%`}
        />
        <ProgressRow
          label="Recurring Bills"
          value={`${dashboard.goals.recurringBills}%`}
          width={`${dashboard.goals.recurringBills}%`}
        />
      </div>

      <div
        className="mt-8 rounded-[1.6rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
        style={{
          borderColor: "var(--card-border)",
          background:
            "linear-gradient(135deg, rgba(91, 140, 255, 0.14), rgba(20, 184, 166, 0.06))",
        }}
      >
        <p className="text-sm text-[var(--text-secondary)]">Recommendation</p>
        <p className="mt-2 text-lg font-semibold tracking-tight">
          {dashboard.recommendation}
        </p>
      </div>
    </Panel>
  );
}

function SummaryCard({ title, value, detail, tone, icon }) {
  const IconComponent = icon;

  return (
    <Panel className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight">{value}</h3>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background:
              tone === "positive" ? "rgba(52, 211, 153, 0.12)" : "var(--accent-soft)",
            color: tone === "positive" ? "var(--success)" : "var(--accent)",
          }}
        >
          <IconComponent size={20} />
        </div>
      </div>

      <div className="mt-6 text-sm text-[var(--text-secondary)]">{detail}</div>
    </Panel>
  );
}

function TrendPanel({ analytics }) {
  const [activePointLabel, setActivePointLabel] = useState(
    analytics.monthlyActivity[analytics.monthlyActivity.length - 1]?.label || null,
  );
  const activePoint = analytics.monthlyActivity.find((item) => item.label === activePointLabel) ||
    analytics.monthlyActivity[analytics.monthlyActivity.length - 1] || null;
  const chartHeight = 220;
  const width = 760;
  const chartWidth = 700;
  const xOffset = 24;
  const step =
    analytics.monthlyActivity.length > 1
      ? chartWidth / (analytics.monthlyActivity.length - 1)
      : 0;
  const values = analytics.monthlyActivity.map((item) => item.count);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const spread = max - min || 1;
  const averageCount =
    values.length > 0
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;
  const change =
    values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0;
  const highestPoint = analytics.monthlyActivity.reduce(
    (best, current) => (current.value > (best?.value ?? -Infinity) ? current : best),
    null,
  );
  const busiestPoint = analytics.monthlyActivity.reduce(
    (best, current) => (current.count > (best?.count ?? -Infinity) ? current : best),
    null,
  );
  const axisLabels = Array.from(new Set([max, max - spread / 2, min].map((value) => Math.round(value))));

  const points = analytics.monthlyActivity
    .map((item, index) => {
      const x = xOffset + index * step;
      const y = chartHeight - ((item.count - min) / spread) * (chartHeight - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${xOffset},${chartHeight} ${points} ${
    xOffset + chartWidth
  },${chartHeight}`;

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Transaction volume trend</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Monthly transaction activity with a statistical trend line and peak-volume markers.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-secondary)]">Latest month</p>
          <p className="mt-2 text-2xl font-semibold">
            {(values[values.length - 1] || 0).toLocaleString()} txns
          </p>
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: change >= 0 ? "var(--success)" : "var(--warning)" }}
          >
            {change >= 0 ? "+" : "-"}
            {Math.abs(change)} vs previous month
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-[1.75rem] border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20" style={{ borderColor: "var(--card-border)" }}>
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <ChartStat
            label="Selected month"
            value={activePoint?.label || "N/A"}
            detail={
              activePoint
                ? `${activePoint.count} transactions | Net ${formatAmount(activePoint.net)}`
                : "No data"
            }
          />
          <ChartStat
            label="Strongest net month"
            value={highestPoint?.label || "N/A"}
            detail={highestPoint ? formatAmount(highestPoint.value) : "No data"}
          />
          <ChartStat
            label="Busiest month"
            value={busiestPoint?.label || "N/A"}
            detail={
              busiestPoint
                ? `${busiestPoint.count} transactions | Avg ${averageCount}/month`
                : "No data"
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[72px_1fr] md:items-end">
          <div className="hidden h-64 md:flex md:flex-col md:justify-between">
            {axisLabels.map((label) => (
              <span key={label} className="text-xs text-[var(--text-secondary)]">
                {label.toLocaleString()}
              </span>
            ))}
          </div>

          <svg
            viewBox={`0 0 ${width} ${chartHeight}`}
            preserveAspectRatio="xMinYMid meet"
            className="block h-64 w-full"
          >
          <defs>
            <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(91, 140, 255, 0.45)" />
              <stop offset="100%" stopColor="rgba(91, 140, 255, 0.02)" />
            </linearGradient>
          </defs>

          <polygon points={areaPoints} fill="url(#trendArea)" />
          <polyline
            points={points}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {analytics.monthlyActivity.map((item, index) => {
            const x = xOffset + index * step;
            const y = chartHeight - ((item.count - min) / spread) * (chartHeight - 24) - 12;
            const isActive = activePoint?.label === item.label;

            return (
              <g key={item.label}>
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? "5.8" : "2.7"}
                  fill="var(--bg-elevated)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? "8.5" : "4.8"}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={isActive ? "2.2" : "1.5"}
                  className="cursor-pointer"
                  onMouseEnter={() => setActivePointLabel(item.label)}
                  onFocus={() => setActivePointLabel(item.label)}
                />
              </g>
            );
          })}

          {analytics.monthlyActivity.map((item, index) => {
            const x = xOffset + index * step;

            return (
              <text
                key={`${item.label}-axis`}
                x={x}
                y={chartHeight - 2}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="4"
              >
                {item.label}
              </text>
            );
          })}
        </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
          {analytics.monthlyActivity.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => setActivePointLabel(item.label)}
              onFocus={() => setActivePointLabel(item.label)}
              onClick={() => setActivePointLabel(item.label)}
              className="rounded-full border px-3 py-2 text-left transition"
              style={{
                borderColor:
                  activePoint?.label === item.label
                    ? "var(--accent-border)"
                    : "var(--card-border)",
                background:
                  activePoint?.label === item.label
                    ? "var(--accent-soft)"
                    : "rgba(255,255,255,0.03)",
                color:
                  activePoint?.label === item.label
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function BreakdownPanel({ dashboard, analytics }) {
  const [activeMonthLabel, setActiveMonthLabel] = useState(() => {
    const defaultMonth = analytics.categoryTimeline[analytics.categoryTimeline.length - 1];
    return defaultMonth?.label || null;
  });
  const activeMonth = analytics.categoryTimeline.find((month) => month.label === activeMonthLabel) ||
    analytics.categoryTimeline[analytics.categoryTimeline.length - 1] || null;

  const selectedSegments = [...(activeMonth?.segments || [])].sort(
    (first, second) => second.amount - first.amount,
  );
  const selectedTotal = activeMonth?.total || 0;
  const selectedTopCategory = selectedSegments[0];
  const selectedMaxAmount = Math.max(...selectedSegments.map((item) => item.amount), 1);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Expenditure by category</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Switch months to compare category mix and spending concentration over time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {analytics.categoryTimeline.map((month) => {
            const isActive = activeMonth?.label === month.label;

            return (
              <button
                key={month.label}
                type="button"
              onClick={() => setActiveMonthLabel(month.label)}
                className="rounded-full border px-3 py-2 text-sm transition"
                style={{
                  borderColor: isActive ? "var(--accent-border)" : "var(--card-border)",
                  background: isActive ? "var(--accent-soft)" : "rgba(255,255,255,0.03)",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      </div>

      {dashboard.spendingBreakdown.length > 0 ? (
        <div className="mt-8 space-y-6">
          <div
            className="rounded-[1.75rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
            style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                  Month overview
                </p>
                <h4 className="mt-2 text-3xl font-semibold tracking-tight">
                  {activeMonth?.label || "N/A"}
                </h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Month-wise category view for the selected month.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--text-secondary)]">Total spend</p>
                <p className="mt-2 text-2xl font-semibold">{formatAmount(selectedTotal)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
              {analytics.topCategories.map((category, index) => (
                <LegendDot
                  key={category}
                  color={ringColors[index % ringColors.length]}
                  label={category}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div
              className="rounded-[1.75rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
              style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Selected month
              </p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight">
                {activeMonth?.label || "N/A"}
              </h4>

              <div className="mt-6 space-y-3">
                <ChartStat
                  label="Total expense"
                  value={formatAmount(selectedTotal)}
                  detail="Combined category spending"
                />
                <ChartStat
                  label="Top category"
                  value={selectedTopCategory?.label || "No spend"}
                  detail={
                    selectedTopCategory
                      ? `${formatAmount(selectedTopCategory.amount)} spent in this category`
                      : "No category data"
                  }
                />
                <ChartStat
                  label="Active categories"
                  value={selectedSegments.filter((item) => item.amount > 0).length.toString()}
                  detail="Categories with spending in this month"
                />
              </div>
            </div>

            <div
              className="flex min-h-[340px] flex-wrap items-center justify-center gap-6 rounded-[1.75rem] border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
              style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.01)" }}
            >
              {selectedSegments.filter((item) => item.amount > 0).length > 0 ? (
                selectedSegments
                  .filter((item) => item.amount > 0)
                  .map((item, index) => {
                    const percent =
                      selectedTotal > 0 ? Math.round((item.amount / selectedTotal) * 100) : 0;
                    const ratio = item.amount / selectedMaxAmount;
                    const size = 90 + Math.sqrt(ratio) * 130; // Scales from 90px to 220px based on amount

                    const colorIndex = analytics.topCategories.indexOf(item.label);
                    const themeColor =
                      ringColors[(colorIndex !== -1 ? colorIndex : index) % ringColors.length];

                    return (
                      <div
                        key={`${activeMonth?.label}-${item.label}`}
                        className="group flex flex-col items-center justify-center rounded-full text-center text-white transition-all duration-300 hover:scale-[1.08]"
                        style={{
                          width: size,
                          height: size,
                          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), ${themeColor} 60%, rgba(0, 0, 0, 0.4))`,
                          boxShadow: `inset -5px -5px 15px rgba(0,0,0,0.2), inset 5px 5px 15px rgba(255,255,255,0.4), 0 15px 35px -5px ${themeColor}88`,
                          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        }}
                      >
                        <span className="max-w-[80%] truncate text-sm font-semibold">
                          {item.label}
                        </span>
                        <span className="mt-1 text-xs font-medium text-white/90">
                          {formatAmount(item.amount)}
                        </span>
                        <span
                          className="mt-1 rounded-full px-2.5 py-0.5 text-sm font-bold tracking-wide"
                          style={{
                            background: "rgba(255, 255, 255, 0.95)",
                            color: themeColor,
                            textShadow: "none",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          {percent}%
                        </span>
                      </div>
                    );
                  })
              ) : (
                <div className="text-sm text-[var(--text-secondary)]">
                  No spending data for this month
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <EmptyPanel
          title="No spending categories yet"
          detail="Your expense categories will appear here once transactions are added."
          compact
        />
      )}
    </Panel>
  );
}

function CashFlowPanel({ dashboard }) {
  const [activeMonthLabel, setActiveMonthLabel] = useState(
    dashboard.monthlyBars[dashboard.monthlyBars.length - 1]?.label || null,
  );
  const activeMonth = dashboard.monthlyBars.find((item) => item.label === activeMonthLabel) ||
    dashboard.monthlyBars[dashboard.monthlyBars.length - 1] || null;
  const width = 760;
  const height = 220;
  const xOffset = 24;
  const chartWidth = 700;
  const step =
    dashboard.monthlyBars.length > 1
      ? chartWidth / (dashboard.monthlyBars.length - 1)
      : 0;
  const values = dashboard.monthlyBars.flatMap((item) => [item.income, item.expense]);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const spread = max - min || 1;
  const axisLabels = Array.from(new Set([max, max - spread / 2, min].map((value) => Math.round(value))));

  const getY = (value) =>
    height - ((value - min) / spread) * (height - 32) - 16;

  const incomePoints = dashboard.monthlyBars
    .map((item, index) => `${xOffset + index * step},${getY(item.income)}`)
    .join(" ");
  const expensePoints = dashboard.monthlyBars
    .map((item, index) => `${xOffset + index * step},${getY(item.expense)}`)
    .join(" ");

  const incomeArea = `${xOffset},${height} ${incomePoints} ${xOffset + chartWidth},${height}`;
  const expenseArea = `${xOffset},${height} ${expensePoints} ${xOffset + chartWidth},${height}`;

  return (
    <Panel>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Income vs expenses</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Compare how inflows and outflows have changed across recent months.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <LegendDot color="rgba(37, 99, 235, 0.9)" label="Income" />
          <LegendDot color="rgba(251, 113, 133, 0.9)" label="Expenses" />
        </div>
      </div>

      <div
        className="mt-8 rounded-[1.75rem] border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
        style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
      >
        <div className="grid gap-4 md:grid-cols-[120px_1fr] md:items-end">
          <div className="hidden h-64 md:flex md:flex-col md:justify-between">
            {axisLabels.map((label) => (
              <span key={label} className="text-xs text-[var(--text-secondary)]">
                {formatAmount(label)}
              </span>
            ))}
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMinYMid meet"
            className="block h-64 w-full"
          >
            <defs>
              <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.45)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.02)" />
              </linearGradient>
              <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(251, 113, 133, 0.45)" />
                <stop offset="100%" stopColor="rgba(251, 113, 133, 0.02)" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((line) => {
              const y = 22 + line * 48;
              return (
                <line
                  key={line}
                  x1={xOffset}
                  x2={xOffset + chartWidth}
                  y1={y}
                  y2={y}
                  stroke="var(--card-border)"
                  strokeDasharray="3 4"
                />
              );
            })}

            <polygon points={incomeArea} fill="url(#incomeArea)" />
            <polygon points={expenseArea} fill="url(#expenseArea)" />

            <polyline
              points={incomePoints}
              fill="none"
              stroke="rgba(37, 99, 235, 0.95)"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={expensePoints}
              fill="none"
              stroke="rgba(251, 113, 133, 0.95)"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {dashboard.monthlyBars.map((item, index) => {
              const x = xOffset + index * step;
              const incomeY = getY(item.income);
              const expenseY = getY(item.expense);
              const isActive = activeMonth?.label === item.label;

              return (
                <g key={item.label}>
                  <circle
                    cx={x}
                    cy={incomeY}
                    r={isActive ? "6.5" : "4"}
                    fill="rgba(37, 99, 235, 0.95)"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveMonthLabel(item.label)}
                    onFocus={() => setActiveMonthLabel(item.label)}
                  />
                  <circle
                    cx={x}
                    cy={expenseY}
                    r={isActive ? "6.5" : "4"}
                    fill="rgba(251, 113, 133, 0.95)"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveMonthLabel(item.label)}
                    onFocus={() => setActiveMonthLabel(item.label)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
          {dashboard.monthlyBars.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => setActiveMonthLabel(item.label)}
              onFocus={() => setActiveMonthLabel(item.label)}
              onClick={() => setActiveMonthLabel(item.label)}
              className="rounded-full border px-3 py-2 text-left transition"
              style={{
                borderColor:
                  activeMonth?.label === item.label
                    ? "var(--accent-border)"
                    : "var(--card-border)",
                background:
                  activeMonth?.label === item.label
                    ? "var(--accent-soft)"
                    : "rgba(255,255,255,0.03)",
                color:
                  activeMonth?.label === item.label
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {activeMonth ? (
        <div
          className="mt-6 rounded-[1.5rem] border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
          style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            Focus month
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="text-2xl font-semibold tracking-tight">{activeMonth.label}</span>
            <span className="text-sm text-[var(--text-secondary)]">
              Income {formatAmount(activeMonth.income)}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              Expense {formatAmount(activeMonth.expense)}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              Net {formatAmount(activeMonth.income - activeMonth.expense)}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              Volume {formatAmount(activeMonth.income + activeMonth.expense)}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              Savings rate{" "}
              {activeMonth.income > 0
                ? Math.max(
                    0,
                    Math.round(
                      ((activeMonth.income - activeMonth.expense) / activeMonth.income) * 100,
                    ),
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function SnapshotPanel({ dashboard }) {
  return (
    <Panel>
      <h3 className="text-2xl font-semibold tracking-tight">Monthly snapshot</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        A quick summary of how efficiently this month is shaping up.
      </p>

      <div className="mt-8 space-y-5">
        <SnapshotRow
          label="Savings rate"
          value={`${dashboard.savingsRate}%`}
          accent="var(--success)"
        />
        <SnapshotRow
          label="Expense ratio"
          value={`${dashboard.expenseRatio}%`}
          accent="var(--warning)"
        />
        <SnapshotRow
          label="Largest category"
          value={dashboard.highestCategory}
          accent="var(--accent)"
        />
      </div>
    </Panel>
  );
}

function ProgressRow({ label, value, width }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full"
        style={{ background: "var(--bg-soft)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width,
            background:
              "linear-gradient(90deg, var(--accent), rgba(20, 184, 166, 0.85))",
          }}
        />
      </div>
    </div>
  );
}

function MetricChip({ label, value }) {
  return (
    <div
      className="rounded-[1.5rem] border px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        borderColor: "var(--card-border)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function SnapshotRow({ label, value, accent }) {
  return (
    <div
      className="flex items-center justify-between rounded-[1.4rem] border px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
      style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
    >
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className="text-lg font-semibold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function ChartStat({ label, value, detail }) {
  return (
    <div
      className="rounded-[1.25rem] border px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
      style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

function EmptyPanel({ title, detail, compact = false }) {
  return (
    <div
      className="rounded-[2rem] border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className={compact ? "" : "py-6"}>
        <p className="text-xl font-semibold tracking-tight">{title}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          {detail}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <section
      className="rounded-[2rem] border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
        Dashboard
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">
        Loading your dashboard...
      </h2>
    </section>
  );
}

function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[2rem] border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${className}`}
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        backdropFilter: "blur(18px)",
      }}
    >
      {children}
    </div>
  );
}

function buildDashboardAnalytics(transactions, spendingBreakdown) {
  const expenseTransactions = transactions.filter((item) => item.type === "expense");
  const monthlyMap = transactions.reduce((accumulator, item) => {
    const monthKey = item.date.slice(0, 7);

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = {
        count: 0,
        income: 0,
        expense: 0,
        categories: {},
      };
    }

    accumulator[monthKey].count += 1;
    accumulator[monthKey][item.type] += item.amount;

    if (item.type === "expense") {
      accumulator[monthKey].categories[item.category] =
        (accumulator[monthKey].categories[item.category] || 0) + item.amount;
    }

    return accumulator;
  }, {});

  const sortedMonths = Object.keys(monthlyMap).sort();
  const latestMonthKey = sortedMonths[sortedMonths.length - 1] || getCurrentMonthKey();
  const visibleMonthKeys = getRecentMonthKeys(latestMonthKey, 5);
  const topCategories = spendingBreakdown.map((item) => item.label);
  const fallbackCategories = Array.from(
    new Set(expenseTransactions.map((item) => item.category)),
  );
  const visibleCategories = topCategories.length > 0 ? topCategories : fallbackCategories;

  const monthlyActivity = visibleMonthKeys.map((monthKey) => {
    const month = monthlyMap[monthKey] || {
      count: 0,
      income: 0,
      expense: 0,
      categories: {},
    };

    return {
      fullLabel: monthKey,
      count: month.count,
      net: month.income - month.expense,
      value: month.income - month.expense,
    };
  }).map((item) => ({
    ...item,
    label: formatMonthShort(item.fullLabel),
  }));

  const categoryTimeline = visibleMonthKeys.map((monthKey) => {
    const month = monthlyMap[monthKey] || {
      count: 0,
      income: 0,
      expense: 0,
      categories: {},
    };
    const segments = visibleCategories.map((category) => ({
      label: category,
      amount: month.categories[category] || 0,
    }));
    const total = segments.reduce((sum, item) => sum + item.amount, 0);
    const topCategory =
      segments.sort((first, second) => second.amount - first.amount)[0]?.label || "No spend";

    return {
      label: formatMonthShort(monthKey),
      total,
      segments: visibleCategories.map((category) => ({
        label: category,
        amount: month.categories[category] || 0,
      })),
      topCategory,
    };
  });

  return {
    monthlyActivity,
    categoryTimeline,
    topCategories: visibleCategories,
  };
}

function formatMonthShort(monthKey) {
  const [, month] = monthKey.split("-");
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return labels[Number(month) - 1] || monthKey;
}

function getRecentMonthKeys(latestMonthKey, count) {
  const [yearText, monthText] = latestMonthKey.split("-");
  const keys = [];
  let year = Number(yearText);
  let month = Number(monthText);

  for (let index = count - 1; index >= 0; index -= 1) {
    let nextYear = year;
    let nextMonth = month - index;

    while (nextMonth <= 0) {
      nextMonth += 12;
      nextYear -= 1;
    }

    keys.push(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
  }

  return keys;
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function calculateTrendLine(values) {
  if (values.length <= 1) {
    return values;
  }

  const meanX = (values.length - 1) / 2;
  const meanY = values.reduce((sum, value) => sum + value, 0) / values.length;
  const numerator = values.reduce(
    (sum, value, index) => sum + (index - meanX) * (value - meanY),
    0,
  );
  const denominator = values.reduce(
    (sum, _value, index) => sum + (index - meanX) ** 2,
    0,
  );
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  return values.map((_value, index) => intercept + slope * index);
}

import { formatAmount, formatMonthLabel } from "./formatters";

export const defaultFilters = {
  search: "",
  type: "all",
  sortBy: "date-desc",
};

export function filterAndSortTransactions(transactions, filters) {
  const query = filters.search.trim().toLowerCase();

  return [...transactions]
    .filter((item) => {
      const matchesType = filters.type === "all" || item.type === filters.type;
      const amountText = String(item.amount).toLowerCase();
      const formattedAmountText = formatAmount(item.amount).toLowerCase();
      const dateText = item.date.toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.merchant.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        amountText.includes(query) ||
        formattedAmountText.includes(query) ||
        dateText.includes(query);

      return matchesType && matchesSearch;
    })
    .sort((first, second) => {
      if (filters.sortBy === "date-desc") {
        return new Date(second.date) - new Date(first.date);
      }

      if (filters.sortBy === "date-asc") {
        return new Date(first.date) - new Date(second.date);
      }

      if (filters.sortBy === "amount-desc") {
        return second.amount - first.amount;
      }

      if (filters.sortBy === "merchant-asc") {
        return first.merchant.localeCompare(second.merchant);
      }

      if (filters.sortBy === "merchant-desc") {
        return second.merchant.localeCompare(first.merchant);
      }

      return first.amount - second.amount;
    });
}

export function summarizeTransactions(transactions) {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expense,
    net: income - expense,
  };
}

export function buildInsights(transactions, insightsMeta = {}) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const incomes = transactions.filter((item) => item.type === "income");
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = expenses.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + item.amount;
    return accumulator;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .sort((first, second) => second[1] - first[1])
    .map(([label, amount]) => ({
      label,
      amount,
      percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));

  const topCategory = categoryBreakdown[0]
    ? {
        title: categoryBreakdown[0].label,
        detail: `${formatAmount(categoryBreakdown[0].amount)} spent here, making it the largest expense bucket.`,
      }
    : {
        title: "No spending categories yet",
        detail: "Add an expense transaction to surface the highest spending category.",
      };

  const monthlyTotals = transactions.reduce((accumulator, item) => {
    const monthKey = item.date.slice(0, 7);

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = { income: 0, expense: 0 };
    }

    accumulator[monthKey][item.type] += item.amount;
    return accumulator;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();
  const currentMonthKey = sortedMonths[sortedMonths.length - 1];
  const previousMonthKey = sortedMonths[sortedMonths.length - 2];
  const currentMonth = currentMonthKey
    ? monthlyTotals[currentMonthKey]
    : { income: 0, expense: 0 };
  const previousMonth = previousMonthKey
    ? monthlyTotals[previousMonthKey]
    : { income: 0, expense: 0 };

  const currentNet = currentMonth.income - currentMonth.expense;
  const previousNet = previousMonth.income - previousMonth.expense;
  const netDelta = currentNet - previousNet;
  const coverage = totalExpense > 0 ? totalIncome / totalExpense : 0;
  const avgExpense =
    expenses.length > 0 ? Math.round(totalExpense / expenses.length) : 0;
  const recentExpenses = [...expenses]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, 4);
  const recentExpenseAverage =
    recentExpenses.length > 0
      ? Math.round(
          recentExpenses.reduce((sum, item) => sum + item.amount, 0) /
            recentExpenses.length,
        )
      : 0;
  const topTwoCategories = categoryBreakdown.slice(0, 2);
  const concentration =
    topTwoCategories.length > 0
      ? topTwoCategories.reduce((sum, item) => sum + item.percent, 0)
      : 0;
  const latestExpense = [...expenses].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  )[0];

  const monthlyComparison = {
    title: previousMonthKey
      ? `${netDelta >= 0 ? "Net flow improved" : "Net flow softened"} by ${formatAmount(Math.abs(netDelta))}`
      : `Current net flow stands at ${formatAmount(currentNet)}`,
    detail: previousMonthKey
      ? `${formatMonthLabel(currentMonthKey)} closed at ${formatAmount(currentNet)} versus ${formatAmount(previousNet)} in ${formatMonthLabel(previousMonthKey)}.`
      : "More monthly data will unlock direct month-on-month comparisons.",
  };

  const observation = {
    title:
      coverage >= 1
        ? "Income comfortably covers spending"
        : "Expenses are moving faster than income",
    detail:
      coverage >= 1
        ? insightsMeta.observationHint ||
          `Income is running at ${coverage.toFixed(2)}x expense volume, leaving room to save and invest.`
        : "Consider tightening discretionary categories to restore positive cash flow.",
  };

  const savingsTip = latestExpense
    ? {
        title: `Review ${latestExpense.category.toLowerCase()} spending next`,
        detail:
          concentration >= 50
            ? `${topTwoCategories[0]?.label || "Top categories"} and ${topTwoCategories[1]?.label || "daily spends"} now account for ${concentration}% of expenses. Trimming even one recurring habit here can create quick savings.`
            : `Recent expenses are averaging ${formatAmount(
                recentExpenseAverage || avgExpense,
              )}. A weekly cap around this level can help keep monthly spending predictable.`,
      }
    : {
        title: "Build a small savings rule",
        detail:
          "Once a few expense entries are available, this section will suggest the easiest category to trim first.",
      };

  const previousDateInsight = previousMonthKey
    ? {
        title: `${formatMonthLabel(previousMonthKey)} vs ${formatMonthLabel(
          currentMonthKey,
        )}`,
        detail: `Expenses moved from ${formatAmount(
          previousMonth.expense,
        )} to ${formatAmount(currentMonth.expense)} while income shifted from ${formatAmount(
          previousMonth.income,
        )} to ${formatAmount(currentMonth.income)}.`,
      }
    : {
        title: "Monthly history is building",
        detail:
          "As more past transactions are added, you will start seeing stronger month-on-month comparisons here.",
      };

  return {
    topCategory,
    monthlyComparison,
    observation,
    savingsTip,
    previousDateInsight,
    categoryBreakdown,
  };
}

export function buildDashboardData(transactions, dashboardConfig, insights) {
  const monthlyTotals = transactions.reduce((accumulator, item) => {
    const monthKey = item.date.slice(0, 7);

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = { income: 0, expense: 0 };
    }

    accumulator[monthKey][item.type] += item.amount;
    return accumulator;
  }, {});

  const sortedMonths = Object.keys(monthlyTotals).sort();
  const currentMonthKey = sortedMonths[sortedMonths.length - 1];
  const previousMonthKey = sortedMonths[sortedMonths.length - 2];
  const currentMonth = currentMonthKey
    ? monthlyTotals[currentMonthKey]
    : { income: 0, expense: 0 };
  const previousMonth = previousMonthKey
    ? monthlyTotals[previousMonthKey]
    : { income: 0, expense: 0 };
  const netSavings = currentMonth.income - currentMonth.expense;
  const previousNet = previousMonth.income - previousMonth.expense;
  const configuredLatestBalance =
    dashboardConfig.balanceTrend[dashboardConfig.balanceTrend.length - 1]?.value || 0;
  const displayedMonths = sortedMonths.length > 0
    ? sortedMonths
    : dashboardConfig.balanceTrend.map((item) => item.label);
  const savingsRate =
    currentMonth.income > 0
      ? Math.max(0, Math.round((netSavings / currentMonth.income) * 100))
      : 0;
  const expenseRatio =
    currentMonth.income > 0
      ? Math.round((currentMonth.expense / currentMonth.income) * 100)
      : 0;
  const monthlyBars = sortedMonths.map((monthKey) => ({
    label: formatMonthLabel(monthKey).split(" ")[0],
    income: monthlyTotals[monthKey].income,
    expense: monthlyTotals[monthKey].expense,
  }));
  const monthlyNetSeries = displayedMonths.map((monthKey) => {
    if (monthlyTotals[monthKey]) {
      return monthlyTotals[monthKey].income - monthlyTotals[monthKey].expense;
    }

    return 0;
  });
  const baseBalance = Math.max(
    0,
    configuredLatestBalance -
      monthlyNetSeries.reduce((sum, value) => sum + value, 0),
  );
  let runningBalance = baseBalance;
  const balanceTrend = displayedMonths.map((monthKey) => {
    const monthNet = monthlyTotals[monthKey]
      ? monthlyTotals[monthKey].income - monthlyTotals[monthKey].expense
      : 0;
    runningBalance += monthNet;

    return {
      label: monthlyTotals[monthKey]
        ? formatMonthLabel(monthKey).split(" ")[0]
        : monthKey,
      value: runningBalance,
    };
  });
  const totalBalance =
    balanceTrend[balanceTrend.length - 1]?.value || configuredLatestBalance;

  return {
    totalBalance,
    currentIncome: currentMonth.income,
    currentExpense: currentMonth.expense,
    netSavings,
    changeFromLastMonth: netSavings - previousNet,
    forecastRunway: dashboardConfig.forecastRunway || "0 months",
    recommendation: dashboardConfig.recommendation || "",
    goals: dashboardConfig.goals || {
      budgetUsed: 0,
      savingsGoal: 0,
      recurringBills: 0,
    },
    balanceTrend,
    spendingBreakdown: insights.categoryBreakdown,
    highestCategory: insights.topCategory.title,
    comparisonTitle: insights.monthlyComparison.title,
    healthLabel: netSavings >= 0 ? "Healthy" : "Watchlist",
    savingsRate,
    expenseRatio,
    monthlyBars,
  };
}

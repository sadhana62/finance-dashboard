async function readMockFinanceData() {
  const response = await fetch("/mock/finance-data.json");

  if (!response.ok) {
    throw new Error("Unable to load mock finance data.");
  }

  const payload = await response.json();

  await new Promise((resolve) => {
    window.setTimeout(resolve, 180);
  });

  return payload;
}

export async function getDashboardOverview() {
  const data = await readMockFinanceData();
  return data.dashboard;
}

export async function getTransactions() {
  const data = await readMockFinanceData();
  return data.transactions;
}

export async function getInsightsMeta() {
  const data = await readMockFinanceData();
  return data.insights;
}

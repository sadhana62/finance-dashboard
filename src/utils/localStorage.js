const STORAGE_KEY = "finance-dashboard-redux";

export function loadPersistedFinanceState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePersistedFinanceState(financeState) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    role: financeState.role,
    filters: financeState.filters,
    transactions: financeState.transactions,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write failures in demo mode.
  }
}

import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import {
  getDashboardOverview,
  getInsightsMeta,
  getTransactions,
} from "../services/mockApi";
import {
  buildDashboardData,
  buildInsights,
  defaultFilters,
  filterAndSortTransactions,
  summarizeTransactions,
} from "../utils/finance";
import { loadPersistedFinanceState } from "../utils/localStorage";

const persistedState = loadPersistedFinanceState();

const initialState = {
  status: "idle",
  error: null,
  role: persistedState?.role || "admin",
  transactions: persistedState?.transactions || [],
  filters: persistedState?.filters || defaultFilters,
  dashboard: {
    balanceTrend: [],
    goals: {
      budgetUsed: 0,
      savingsGoal: 0,
      recurringBills: 0,
    },
    recommendation: "",
    forecastRunway: "",
  },
  insightsMeta: {},
};

export const initializeFinanceData = createAsyncThunk(
  "finance/initialize",
  async () => {
    const [dashboard, transactions, insightsMeta] = await Promise.all([
      getDashboardOverview(),
      getTransactions(),
      getInsightsMeta(),
    ]);

    return {
      dashboard,
      transactions,
      insightsMeta,
    };
  },
);

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setRole(state, action) {
      state.role = action.payload;
    },
    updateFilter(state, action) {
      const { name, value } = action.payload;
      state.filters[name] = value;
    },
    resetFilters(state) {
      state.filters = defaultFilters;
    },
    addTransaction(state, action) {
      state.transactions.unshift({
        ...action.payload,
        id: Date.now(),
      });
    },
    updateTransaction(state, action) {
      const { id, changes } = action.payload;
      const existing = state.transactions.find((item) => item.id === id);

      if (existing) {
        Object.assign(existing, changes);
      }
    },
    deleteTransaction(state, action) {
      state.transactions = state.transactions.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeFinanceData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeFinanceData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboard = action.payload.dashboard;
        state.insightsMeta = action.payload.insightsMeta;

        const mergedTransactions = new Map(
          action.payload.transactions.map((item) => [item.id, item]),
        );

        state.transactions.forEach((item) => {
          mergedTransactions.set(item.id, item);
        });

        state.transactions = Array.from(mergedTransactions.values());
      })
      .addCase(initializeFinanceData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load finance data.";
      });
  },
});

export const {
  addTransaction,
  deleteTransaction,
  resetFilters,
  setRole,
  updateFilter,
  updateTransaction,
} =
  financeSlice.actions;

export default financeSlice.reducer;

export const selectFinanceState = (state) => state.finance;
export const selectRole = (state) => state.finance.role;
export const selectTransactions = (state) => state.finance.transactions;
export const selectTransactionFilters = (state) => state.finance.filters;
export const selectFinanceStatus = (state) => state.finance.status;
export const selectFinanceError = (state) => state.finance.error;

export const selectFilteredTransactions = createSelector(
  [selectTransactions, selectTransactionFilters],
  (transactions, filters) => filterAndSortTransactions(transactions, filters),
);

export const selectVisibleSummary = createSelector(
  [selectFilteredTransactions],
  (transactions) => summarizeTransactions(transactions),
);

export const selectInsightsData = createSelector(
  [selectTransactions, selectFinanceState],
  (transactions, finance) => buildInsights(transactions, finance.insightsMeta),
);

export const selectDashboardData = createSelector(
  [selectTransactions, selectFinanceState, selectInsightsData],
  (transactions, finance, insights) =>
    buildDashboardData(transactions, finance.dashboard, insights),
);

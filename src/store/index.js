import { configureStore } from "@reduxjs/toolkit";
import financeReducer from "./financeSlice";
import { savePersistedFinanceState } from "../utils/localStorage";

export const store = configureStore({
  reducer: {
    finance: financeReducer,
  },
});

store.subscribe(() => {
  savePersistedFinanceState(store.getState().finance);
});

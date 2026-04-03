import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import {
  initializeFinanceData,
  selectFinanceError,
  selectFinanceStatus,
} from "./store/financeSlice";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const dispatch = useDispatch();
  const status = useSelector(selectFinanceStatus);
  const error = useSelector(selectFinanceError);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(initializeFinanceData());
    }
  }, [dispatch, status]);

  function renderPage() {
    if (currentPage === "transactions") {
      return <Transactions />;
    }

    if (currentPage === "insights") {
      return <Insights />;
    }

    return <Dashboard />;
  }

  return (
    <AppShell
      theme={theme}
      setTheme={setTheme}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      {status === "failed" ? <ErrorState message={error} /> : renderPage()}
    </AppShell>
  );
}

function ErrorState({ message }) {
  return (
    <section
      className="rounded-[2rem] border p-8"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--danger)]">
        Mock API Error
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">
        We could not load the demo data.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        {message}
      </p>
    </section>
  );
}

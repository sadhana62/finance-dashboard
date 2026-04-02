import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [role, setRole] = useState("admin");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <AppShell
      theme={theme}
      setTheme={setTheme}
      role={role}
      setRole={setRole}
    >
      <Dashboard />
    </AppShell>
  );
}
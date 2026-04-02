import { Bell, Search, Settings } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import RoleSwitcher from "../ui/RoleSwitcher.jsx";

export default function Topbar({ theme, setTheme, role, setRole }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div
          className="flex w-full max-w-md items-center gap-3 rounded-full border px-4 py-3"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--card-border)",
            boxShadow: "var(--shadow)",
          }}
        >
          <Search size={18} className="text-[var(--text-secondary)]" />
          <input
            placeholder="Search analytics..."
            className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <RoleSwitcher role={role} setRole={setRole} />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle theme={theme} setTheme={setTheme} />

        <button
          className="rounded-full border p-3"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--card-border)",
          }}
        >
          <Bell size={18} />
        </button>

        <button
          className="rounded-full border p-3"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--card-border)",
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
import { Moon, Sun } from "lucide-react";
import Tooltip from "./Tooltip";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <Tooltip
      content={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      position="bottom"
    >
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full border px-4 py-3 transition"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--card-border)",
        }}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </Tooltip>
  );
}

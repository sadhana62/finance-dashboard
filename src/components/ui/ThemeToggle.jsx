import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full border px-4 py-3 transition"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--card-border)",
      }}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
import { Shield, UserRound } from "lucide-react";
import Tooltip from "./Tooltip";

const roles = [
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
  },
  {
    value: "viewer",
    label: "Viewer",
    icon: UserRound,
  },
];

export default function RoleSwitcher({ role, setRole }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-2 py-2"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        className="flex items-center rounded-full p-1"
        style={{ background: "var(--accent-soft)" }}
      >
        {roles.map(({ value, label, icon: Icon }) => {
          const active = role === value;

          return (
            <Tooltip key={value} content={label} position="bottom">
              <button
                type="button"
                onClick={() => setRole(value)}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-left text-sm transition"
                style={{
                  background: active ? "var(--bg-elevated)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: active ? "0 8px 20px rgba(15, 23, 42, 0.08)" : "none",
                }}
                aria-pressed={active}
                aria-label={`Switch to ${label}`}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  <Icon size={15} />
                </div>

                <span className="hidden pr-1 font-medium sm:inline">{label}</span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

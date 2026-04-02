import { LayoutDashboard, ReceiptText, Sparkles } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Transactions", icon: ReceiptText, active: false },
  { label: "Insights", icon: Sparkles, active: true },
];

export default function Sidebar() {
  return (
    <aside
      className="hidden border-r px-4 py-6 lg:flex lg:flex-col"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--accent)]">
          Ethereal Ledger
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Wealth Intelligence
        </p>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map(({ label, icon, active }) => {
          const ItemIcon = icon;

          return (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                active ? "shadow-sm" : ""
              }`}
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <ItemIcon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border p-4"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="text-sm font-medium text-[var(--text-primary)]">
          EtherealOrg
        </div>
        <div className="text-xs text-[var(--text-secondary)]">
          Enterprise Plan
        </div>
      </div>
    </aside>
  );
}
import { LayoutDashboard, ReceiptText, Sparkles } from "lucide-react";

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ReceiptText },
  { id: "insights", label: "Insights", icon: Sparkles },
];

export default function Sidebar({ currentPage, setCurrentPage }) {
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
          Transaction
          Ledger
        </h1>
        {/* <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Wealth Intelligence
        </p> */}
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map(({ id, label, icon }) => {
          const ItemIcon = icon;
          const active = currentPage === id;

          return (
            <button
              key={label}
              type="button"
              onClick={() => setCurrentPage(id)}
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

     
    </aside>
  );
}

import Sidebar, { navItems } from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  children,
  theme,
  setTheme,
  currentPage,
  setCurrentPage,
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: `var(--page-gradient), var(--bg)`,
      }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <main className="px-4 py-4 md:px-6 md:py-5 xl:px-8">
          <Topbar theme={theme} setTheme={setTheme} />

          <div className="mt-6 pb-24 lg:pb-0">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 px-3 py-3 lg:hidden">
        <div
          className="mx-auto grid max-w-lg grid-cols-3 gap-2 rounded-[1.75rem] border p-2"
          style={{
            background: "var(--sidebar-bg)",
            borderColor: "var(--sidebar-border)",
            boxShadow: "var(--shadow)",
            backdropFilter: "blur(18px)",
          }}
        >
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setCurrentPage(id)}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-xs font-medium transition"
                style={{
                  background: active ? "var(--accent-soft)" : "transparent",
                  border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  children,
  theme,
  setTheme,
  role,
  setRole,
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: `var(--page-gradient), var(--bg)`,
      }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <Sidebar />

        <main className="px-4 py-4 md:px-6 md:py-5 xl:px-8">
          <Topbar
            theme={theme}
            setTheme={setTheme}
            role={role}
            setRole={setRole}
          />

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
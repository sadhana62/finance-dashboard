export default function RoleSwitcher({ role, setRole }) {
  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="rounded-full border px-4 py-3 outline-none"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--card-border)",
        color: "var(--text-primary)",
      }}
    >
      <option value="admin">Admin</option>
      <option value="viewer">Viewer</option>
    </select>
  );
}
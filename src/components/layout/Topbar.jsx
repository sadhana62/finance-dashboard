import { useDispatch, useSelector } from "react-redux";
import ThemeToggle from "../ui/ThemeToggle";
import RoleSwitcher from "../ui/RoleSwitcher.jsx";
import { selectRole, setRole } from "../../store/financeSlice";

export default function Topbar({ theme, setTheme }) {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);

  return (
    <div className="flex w-full items-start justify-between gap-4 sm:items-center">
      {/* Mobile Branding - Only visible on small screens */}
      <div className="flex-1 lg:hidden">
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-[var(--accent)] sm:text-2xl">
          Transaction
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Ledger
        </h1>
      </div>

      {/**/}
      <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
        <RoleSwitcher role={role} setRole={(value) => dispatch(setRole(value))} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
}

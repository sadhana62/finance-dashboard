import { useDispatch, useSelector } from "react-redux";
import ThemeToggle from "../ui/ThemeToggle";
import RoleSwitcher from "../ui/RoleSwitcher.jsx";
import { selectRole, setRole } from "../../store/financeSlice";

export default function Topbar({ theme, setTheme }) {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);

  return (
    <div className="flex w-full justify-end">
      <div className="flex w-full flex-wrap items-center justify-end gap-3">
        <RoleSwitcher role={role} setRole={(value) => dispatch(setRole(value))} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
}

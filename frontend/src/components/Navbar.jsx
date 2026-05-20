import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";
import logoUrl from "../assets/logo.svg";
import { AccentPicker } from "./AccentPicker.jsx";

export function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-soft transition duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-glow dark:bg-white/10 dark:ring-white/10">
            <img src={logoUrl} alt="Ethera" className="h-6 w-6" />
          </span>
          <span className="font-semibold tracking-tight text-slate-900 dark:text-white">
            Ethera <span className="text-slate-500 dark:text-slate-300">Task Manager</span>
          </span>
        </Link>

        {token ? (
          <nav className="flex items-center gap-3">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-lg px-2 py-1 text-sm ${
                  isActive
                    ? "bg-slate-900/5 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `rounded-lg px-2 py-1 text-sm ${
                  isActive
                    ? "bg-slate-900/5 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                }`
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `rounded-lg px-2 py-1 text-sm ${
                  isActive
                    ? "bg-slate-900/5 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                    : "text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                }`
              }
            >
              Tasks
            </NavLink>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</span>
              <span
                className={`chip ${
                  user?.role === "admin"
                    ? "bg-slate-900/5 text-slate-900 ring-slate-900/10 dark:bg-white/10 dark:text-white dark:ring-white/10"
                    : "bg-brand-600/10 text-brand-700 ring-brand-600/20 dark:text-brand-200"
                }`}
              >
                {user?.role}
              </span>
            </div>
            <AccentPicker />
            <ThemeToggle />
            <button className="btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <AccentPicker />
            <ThemeToggle />
            <NavLink to="/login" className="btn-secondary">
              Login
            </NavLink>
            <NavLink to="/signup" className="btn-primary">
              Signup
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

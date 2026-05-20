import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";
import { useAuth } from "../state/AuthContext.jsx";
import { getErrorMessage } from "../utils/httpError.js";
import { useToast } from "../state/ToastContext.jsx";
import logoUrl from "../assets/logo.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) return setError("Email is required");
    if (!form.password.trim()) return setError("Password is required");
    try {
      setLoading(true);
      const { data } = await http.post("/auth/login", { email: form.email.trim(), password: form.password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user?.name || "user"}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition hover:-translate-y-0.5"
              style={{ background: "var(--accentSoft)", color: "var(--accent)", borderColor: "var(--accentRing)" }}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
              Secure • JWT • Role-based
            </div>
            <img src={logoUrl} alt="Ethera" className="h-10 w-10 opacity-90" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Ship tasks. Not chaos.</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            A clean team workflow for projects, deadlines, and status tracking.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
              <div className="text-sm font-semibold">Admin powers</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Create projects, manage members, assign tasks.</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
              <div className="text-sm font-semibold">Member focus</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">See what’s yours. Update only your statuses.</div>
            </div>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="text-xl font-semibold">Login</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in to manage projects and tasks.</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <div className="label">Email</div>
              <input
                className="input mt-1"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <div className="label">Password</div>
              <input
                className="input mt-1"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            {error ? <div className="text-sm text-rose-700">{error}</div> : null}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            New here?{" "}
            <Link className="font-semibold text-slate-900 hover:underline dark:text-white" to="/signup">
              Create an account
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}

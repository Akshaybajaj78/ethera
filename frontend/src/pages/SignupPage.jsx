import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";
import { useAuth } from "../state/AuthContext.jsx";
import { getErrorMessage } from "../utils/httpError.js";
import { useToast } from "../state/ToastContext.jsx";
import logoUrl from "../assets/logo.svg";

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Name must be at least 2 characters");
    if (!form.email.trim()) return setError("Email is required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    try {
      setLoading(true);
      const { data } = await http.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      login(data.token, data.user);
      toast.success(`Account created for ${data.user?.name || "user"}`);
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
              Tip: Use <span className="kbd">Admin</span> for creating projects
            </div>
            <img src={logoUrl} alt="Ethera" className="h-10 w-10 opacity-90" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Set your team up for wins.</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Create projects, add members, assign tasks, and keep deadlines visible.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
            <div className="text-sm font-semibold">Roles</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">Admin:</span> manage everything.
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">Member:</span> update your task status only.
              </li>
            </ul>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Start as a Member or Admin.</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div>
              <div className="label">Name</div>
              <input
                className="input mt-1"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
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
            <div>
              <div className="label">Role</div>
              <select
                className="input mt-1"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <div className="mt-1 text-xs text-slate-500">
                For a real production app, role assignment should be restricted to admins.
              </div>
            </div>

            {error ? <div className="text-sm text-rose-700">{error}</div> : null}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating..." : "Signup"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-900 hover:underline dark:text-white" to="/login">
              Login
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}

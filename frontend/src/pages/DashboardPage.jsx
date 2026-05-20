import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http.js";
import { DashboardStats } from "../components/DashboardStats.jsx";
import { getErrorMessage } from "../utils/httpError.js";
import { Skeleton } from "../components/Skeleton.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tasksByStatus = useMemo(() => {
    const map = new Map();
    (stats?.tasksByStatus || []).forEach((s) => map.set(s.status, s.count));
    return ["Todo", "In Progress", "Completed"].map((k) => ({ status: k, count: map.get(k) || 0 }));
  }, [stats]);

  const chipForStatus = (status) =>
    status === "Completed"
      ? "bg-emerald-500/10 text-emerald-800 ring-emerald-600/20 dark:text-emerald-200"
      : status === "In Progress"
        ? "bg-amber-500/10 text-amber-800 ring-amber-600/20 dark:text-amber-200"
        : "bg-slate-900/5 text-slate-700 ring-slate-900/10 dark:bg-white/10 dark:text-white dark:ring-white/10";

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [dashRes, overdueRes] = await Promise.all([
        http.get("/dashboard"),
        http.get("/tasks", { params: { overdue: "true" } }),
      ]);
      setStats(dashRes.data.stats);
      setOverdue((overdueRes.data.tasks || []).slice(0, 6));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container-page space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {isAdmin ? "Full team overview." : "Your work overview."} Fresh stats, overdue tasks, and status breakdown.
          </p>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}
      {loading && !stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
      ) : null}

      {stats ? (
        <>
          <DashboardStats stats={stats} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Tasks by status</div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Distribution across Todo/In Progress/Completed.</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {tasksByStatus.map((s) => {
                  const pct = stats.totalTasks ? Math.round((s.count / stats.totalTasks) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">{s.status}</div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {s.count} • {pct}%
                        </div>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                        <div
                          className={`h-full rounded-full ${
                            s.status === "Completed"
                              ? "bg-emerald-500"
                              : s.status === "In Progress"
                                ? "bg-amber-500"
                                : "bg-slate-900 dark:bg-white"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Overdue tasks</div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {isAdmin ? "Across the team." : "Assigned to you."}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip bg-rose-500/10 text-rose-800 ring-rose-600/20 dark:text-rose-200">
                    {stats.overdueTasks ?? 0}
                  </span>
                  <Link to="/tasks" className="btn-secondary px-3 py-1 text-xs">
                    View all
                  </Link>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {overdue.length ? (
                  overdue.map((t) => (
                    <div key={t._id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{t.title}</div>
                          <div className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
                            {t.projectId?.title ? `Project: ${t.projectId.title}` : "Project: —"} • Due {formatDate(t.dueDate)}
                          </div>
                        </div>
                        <span className={`chip ${chipForStatus(t.status)}`}>{t.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                    No overdue tasks. Keep it up.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

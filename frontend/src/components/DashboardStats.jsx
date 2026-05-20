function Icon({ kind }) {
  const common = "h-5 w-5";
  if (kind === "projects")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path
          d="M4 7a3 3 0 0 1 3-3h4l2 2h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (kind === "tasks")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path
          d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  if (kind === "done")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path
          d="m20 7-10 10-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (kind === "pending")
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
        <path
          d="M12 8v5l3 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
      <path
        d="M12 9v4m0 4h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.3 4.3a2 2 0 0 1 3.4 0l8 13.5A2 2 0 0 1 20 20H4a2 2 0 0 1-1.7-2.2l8-13.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tile({ label, value, kind, tone }) {
  const toneClass =
    tone === "brand"
      ? "bg-brand-600/10 text-brand-700 ring-brand-600/20 dark:text-brand-200"
      : tone === "good"
        ? "bg-emerald-500/10 text-emerald-800 ring-emerald-600/20 dark:text-emerald-200"
        : tone === "warn"
          ? "bg-amber-500/10 text-amber-800 ring-amber-600/20 dark:text-amber-200"
          : "bg-rose-500/10 text-rose-800 ring-rose-600/20 dark:text-rose-200";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">{value ?? 0}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-2xl ring-1 ${toneClass}`}>
          <Icon kind={kind} />
        </div>
      </div>
    </div>
  );
}

export function DashboardStats({ stats }) {
  const cards = [
    { label: "Projects", value: stats.totalProjects, kind: "projects", tone: "brand" },
    { label: "Tasks", value: stats.totalTasks, kind: "tasks", tone: "brand" },
    { label: "Completed", value: stats.completedTasks, kind: "done", tone: "good" },
    { label: "Pending", value: stats.pendingTasks, kind: "pending", tone: "warn" },
    { label: "Overdue", value: stats.overdueTasks, kind: "overdue", tone: "bad" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {cards.map((c) => (
        <Tile key={c.label} {...c} />
      ))}
    </div>
  );
}

import { formatDate } from "../utils/format.js";

const statusStyle = {
  Todo: "bg-slate-900/5 text-slate-700 ring-slate-900/10 dark:bg-white/10 dark:text-white dark:ring-white/10",
  "In Progress": "bg-amber-500/10 text-amber-800 ring-amber-600/20 dark:text-amber-200",
  Completed: "bg-emerald-500/10 text-emerald-800 ring-emerald-600/20 dark:text-emerald-200",
};

const priorityStyle = {
  Low: "bg-sky-500/10 text-sky-800 ring-sky-600/20 dark:text-sky-200",
  Medium: "bg-brand-600/10 text-brand-700 ring-brand-600/20 dark:text-brand-200",
  High: "bg-rose-500/10 text-rose-800 ring-rose-600/20 dark:text-rose-200",
};

export function TaskCard({ task, onAdminEdit, onAdminDelete, onMemberStatusChange, isAdmin }) {
  const overdue = task.status !== "Completed" && new Date(task.dueDate) < new Date();
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{task.title}</div>
          <div className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            {task.description ? (
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{task.description}</span>
            ) : (
              "—"
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`chip ${statusStyle[task.status] || statusStyle.Todo}`}>{task.status}</span>
          <span className={`chip ${priorityStyle[task.priority] || priorityStyle.Medium}`}>{task.priority}</span>
          {overdue ? <span className="chip bg-rose-500/10 text-rose-700 ring-rose-600/20">Overdue</span> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Project: {task.projectId?.title || "—"} • Assigned to: {task.assignedTo?.name || "—"} • Due{" "}
          {formatDate(task.dueDate)}
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => onAdminEdit?.(task)}>
              Edit
            </button>
            <button className="btn-danger" onClick={() => onAdminDelete?.(task)}>
              Delete
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              className="input py-1"
              value={task.status}
              onChange={(e) => onMemberStatusChange?.(task, e.target.value)}
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

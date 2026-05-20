import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";

export function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="card block p-4 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-glow dark:hover:bg-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{project.title}</div>
          <div className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
            {project.description ? (
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{project.description}</span>
            ) : (
              "—"
            )}
          </div>
        </div>
        <span className="chip bg-slate-900/5 text-slate-700 ring-slate-900/10 dark:bg-white/10 dark:text-white dark:ring-white/10">
          Due {formatDate(project.deadline)}
        </span>
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Team: {project.teamMembers?.length ?? 0} • Created by {project.createdBy?.name || "—"}
      </div>
    </Link>
  );
}

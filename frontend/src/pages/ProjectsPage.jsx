import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http.js";
import { ProjectCard } from "../components/ProjectCard.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { getErrorMessage } from "../utils/httpError.js";
import { Modal } from "../components/Modal.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { useToast } from "../state/ToastContext.jsx";

export function ProjectsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", deadline: "" });
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await http.get("/projects");
      setProjects(data.projects || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? projects
      : projects.filter((p) => (p.title || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    return filtered.slice().sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [projects, query]);

  const createProject = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (createForm.title.trim().length < 2) return setCreateError("Title must be at least 2 characters");
    if (!createForm.deadline) return setCreateError("Deadline is required");
    try {
      setCreateLoading(true);
      await http.post("/projects", {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        deadline: new Date(createForm.deadline).toISOString(),
        teamMembers: [],
      });
      setCreateForm({ title: "", description: "", deadline: "" });
      setCreateOpen(false);
      toast.success("Project created");
      await load();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="container-page space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {isAdmin ? "Create projects and manage teams." : "Projects assigned to you."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
          {isAdmin ? (
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              New Project
            </button>
          ) : null}
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="label">Search</div>
            <input
              className="input mt-1"
              placeholder="Search by title or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="label">Count</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{visible.length}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{projects.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}

      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((p) => (
          <ProjectCard key={p._id} project={p} />
        ))}
      </div>

      {!loading && projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          subtitle={isAdmin ? "Create your first project and start assigning work." : "Ask an admin to add you to a project."}
          action={
            isAdmin ? (
              <button className="btn-primary" onClick={() => setCreateOpen(true)}>
                Create project
              </button>
            ) : null
          }
        />
      ) : null}

      <Modal
        open={createOpen}
        title="Create project"
        description="Set a title, deadline, and a short description. You can add members after creating."
        onClose={() => (createLoading ? null : setCreateOpen(false))}
      >
        <form onSubmit={createProject} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="label">Title</div>
              <input
                className="input mt-1"
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <div className="label">Deadline</div>
              <input
                type="date"
                className="input mt-1"
                value={createForm.deadline}
                onChange={(e) => setCreateForm((p) => ({ ...p, deadline: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <div className="label">Description</div>
              <textarea
                rows={4}
                className="input mt-1"
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>

          {createError ? <div className="text-sm text-rose-700">{createError}</div> : null}

          <div className="flex items-center justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)} disabled={createLoading}>
              Cancel
            </button>
            <button className="btn-primary" disabled={createLoading}>
              {createLoading ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


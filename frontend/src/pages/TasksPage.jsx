import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http.js";
import { TaskCard } from "../components/TaskCard.jsx";
import { TaskForm } from "../components/TaskForm.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { getErrorMessage } from "../utils/httpError.js";
import { Modal } from "../components/Modal.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { useToast } from "../state/ToastContext.jsx";

export function TasksPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ status: "", overdue: false, projectId: "", priority: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.overdue) params.overdue = "true";
      if (filters.projectId) params.projectId = filters.projectId;
      const [tRes, pRes] = await Promise.all([http.get("/tasks", { params }), http.get("/projects")]);
      let list = tRes.data.tasks || [];
      if (filters.priority) list = list.filter((t) => t.priority === filters.priority);
      setTasks(list);
      setProjects(pRes.data.projects || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.status, filters.overdue, filters.projectId, filters.priority]);

  const openCreate = () => {
    setEditingTask(null);
    setFormError("");
    setModalOpen(true);
  };

  const onAdminSubmit = async (payload) => {
    setFormError("");
    try {
      setBusy(true);
      if (editingTask) {
        await http.patch(`/tasks/${editingTask._id}`, payload);
        toast.success("Task updated");
      } else {
        await http.post("/tasks", payload);
        toast.success("Task created");
      }
      setModalOpen(false);
      setEditingTask(null);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onAdminDelete = async (task) => {
    if (!confirm("Delete this task?")) return;
    try {
      setBusy(true);
      await http.delete(`/tasks/${task._id}`);
      toast.success("Task deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onAdminEdit = (task) => {
    setEditingTask(task);
    setFormError("");
    setModalOpen(true);
  };

  const onMemberStatusChange = async (task, status) => {
    try {
      await http.patch(`/tasks/${task._id}/my-status`, { status });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status } : t)));
      toast.success(`Status updated → ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const counts = useMemo(() => {
    const c = { Todo: 0, "In Progress": 0, Completed: 0 };
    tasks.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    return c;
  }, [tasks]);

  return (
    <div className="container-page space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {isAdmin ? "All tasks across projects." : "Tasks assigned to you."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
          {isAdmin ? (
            <button className="btn-primary" onClick={openCreate}>
              New Task
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {["Todo", "In Progress", "Completed"].map((k) => (
          <div key={k} className="card p-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{k}</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">{counts[k] || 0}</div>
          </div>
        ))}
        <div className="card p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">{tasks.length}</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <div className="label">Project</div>
            <select
              className="input mt-1"
              value={filters.projectId}
              onChange={(e) => setFilters((p) => ({ ...p, projectId: e.target.value }))}
            >
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="label">Status</div>
            <select
              className="input mt-1"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <div className="label">Priority</div>
            <select
              className="input mt-1"
              value={filters.priority}
              onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(e) => setFilters((p) => ({ ...p, overdue: e.target.checked }))}
              />
              Overdue only
            </label>
          </div>
        </div>
      </div>

      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}

      {loading && tasks.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {tasks.map((t) => (
          <TaskCard
            key={t._id}
            task={t}
            isAdmin={isAdmin}
            onAdminEdit={onAdminEdit}
            onAdminDelete={onAdminDelete}
            onMemberStatusChange={onMemberStatusChange}
          />
        ))}
      </div>

      {!loading && tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          subtitle={filters.overdue || filters.status || filters.projectId || filters.priority ? "Try clearing filters." : "Admins can create tasks and assign them to members."}
          action={
            isAdmin ? (
              <button className="btn-primary" onClick={openCreate}>
                Create task
              </button>
            ) : null
          }
        />
      ) : null}

      <Modal
        open={modalOpen}
        title={editingTask ? "Edit task" : "Create task"}
        description="Pick a project, assign a team member, set priority/status and a due date."
        onClose={() => (busy ? null : setModalOpen(false))}
      >
        {busy ? <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">Saving…</div> : null}
        {formError ? (
          <div className="mb-3 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-800 ring-1 ring-rose-600/20 dark:text-rose-200">
            {formError}
          </div>
        ) : null}
        <TaskForm
          projects={projects}
          initialTask={editingTask}
          onSubmit={onAdminSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
        />
      </Modal>
    </div>
  );
}


import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http.js";
import { useAuth } from "../state/AuthContext.jsx";
import { TaskCard } from "../components/TaskCard.jsx";
import { TaskForm } from "../components/TaskForm.jsx";
import { Modal } from "../components/Modal.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { formatDate } from "../utils/format.js";
import { getErrorMessage } from "../utils/httpError.js";
import { useToast } from "../state/ToastContext.jsx";

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [memberId, setMemberId] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskBusy, setTaskBusy] = useState(false);
  const [taskError, setTaskError] = useState("");

  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", deadline: "" });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [pRes, tRes] = await Promise.all([
        http.get(`/projects/${projectId}`),
        http.get("/tasks", { params: { projectId } }),
      ]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await http.get("/users");
      setUsers(data.users || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    loadUsers();
  }, [projectId]);

  const teamIds = useMemo(
    () => new Set((project?.teamMembers || []).map((m) => String(m._id || m))),
    [project]
  );
  const nonTeamUsers = useMemo(() => (users || []).filter((u) => !teamIds.has(String(u._id))), [users, teamIds]);

  const addMember = async () => {
    if (!memberId) return;
    setMemberError("");
    try {
      setMemberLoading(true);
      const { data } = await http.post(`/projects/${projectId}/members/add`, { userId: memberId });
      setProject((p) => ({ ...p, teamMembers: data.project.teamMembers }));
      toast.success("Member added");
      setMemberId("");
    } catch (err) {
      setMemberError(getErrorMessage(err));
    } finally {
      setMemberLoading(false);
    }
  };

  const removeMember = async (userId) => {
    if (!confirm("Remove this member from the project?")) return;
    setMemberError("");
    try {
      setMemberLoading(true);
      const { data } = await http.post(`/projects/${projectId}/members/remove`, { userId });
      setProject((p) => ({ ...p, teamMembers: data.project.teamMembers }));
      toast.success("Member removed");
    } catch (err) {
      setMemberError(getErrorMessage(err));
    } finally {
      setMemberLoading(false);
    }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskError("");
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskError("");
    setTaskModalOpen(true);
  };

  const onTaskSubmit = async (payload) => {
    setTaskError("");
    try {
      setTaskBusy(true);
      if (editingTask) {
        await http.patch(`/tasks/${editingTask._id}`, payload);
        toast.success("Task updated");
      } else {
        await http.post("/tasks", payload);
        toast.success("Task created");
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      await load();
    } catch (err) {
      setTaskError(getErrorMessage(err));
    } finally {
      setTaskBusy(false);
    }
  };

  const onTaskDelete = async (task) => {
    if (!confirm("Delete this task?")) return;
    try {
      setTaskBusy(true);
      await http.delete(`/tasks/${task._id}`);
      toast.success("Task deleted");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTaskBusy(false);
    }
  };

  const openEditProject = () => {
    if (!project) return;
    setEditError("");
    setEditForm({
      title: project.title || "",
      description: project.description || "",
      deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
    });
    setEditProjectOpen(true);
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setEditError("");
    if (editForm.title.trim().length < 2) return setEditError("Title must be at least 2 characters");
    if (!editForm.deadline) return setEditError("Deadline is required");
    try {
      setEditBusy(true);
      const { data } = await http.patch(`/projects/${projectId}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        deadline: new Date(editForm.deadline).toISOString(),
      });
      setProject(data.project);
      setEditProjectOpen(false);
      toast.success("Project updated");
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditBusy(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      setEditBusy(true);
      await http.delete(`/projects/${projectId}`);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <div className="container-page space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <Link className="hover:underline" to="/projects">
              Projects
            </Link>{" "}
            / Details
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{project?.title || "Project"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
          {isAdmin ? (
            <>
              <button className="btn-secondary" onClick={openEditProject} disabled={!project}>
                Edit project
              </button>
              <button className="btn-primary" onClick={openCreateTask} disabled={!project}>
                New task
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}

      {loading && !project ? (
        <div className="card p-6">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ) : null}

      {project ? (
        <>
          <div className="card p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="text-sm font-semibold">Description</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                  {project.description || "—"}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold">Deadline</div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDate(project.deadline)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">Creator</div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{project.createdBy?.name || "—"}</div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{project.createdBy?.email || ""}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Team</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {project.teamMembers?.length ?? 0} members
                </div>
              </div>
              {isAdmin ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select className="input py-2" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                    <option value="">Add member…</option>
                    {nonTeamUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>
                  <button className="btn-primary" onClick={addMember} disabled={memberLoading || !memberId}>
                    {memberLoading ? "Adding…" : "Add"}
                  </button>
                </div>
              ) : null}
            </div>

            {memberError ? <div className="mt-3 text-sm text-rose-700">{memberError}</div> : null}

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(project.teamMembers || []).map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{m.email}</div>
                  </div>
                  {isAdmin ? (
                    <button className="btn-secondary" onClick={() => removeMember(m._id)} disabled={memberLoading}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Tasks</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Everything for this project.</div>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                isAdmin={isAdmin}
                onAdminEdit={openEditTask}
                onAdminDelete={onTaskDelete}
              />
            ))}
            {tasks.length === 0 ? (
              <div className="card p-6 text-sm text-slate-600 dark:text-slate-300">No tasks yet.</div>
            ) : null}
          </div>
        </>
      ) : null}

      <Modal
        open={taskModalOpen}
        title={editingTask ? "Edit task" : "Create task"}
        description="Admins can create/update/assign tasks. Assigned user must be on the project team."
        onClose={() => (taskBusy ? null : setTaskModalOpen(false))}
      >
        {taskError ? <div className="mb-3 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-800 ring-1 ring-rose-600/20 dark:text-rose-200">{taskError}</div> : null}
        {taskBusy ? <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">Saving…</div> : null}
        <TaskForm
          users={project?.teamMembers || []}
          projects={project ? [project] : []}
          initialTask={editingTask}
          onSubmit={onTaskSubmit}
          onCancel={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
        />
      </Modal>

      <Modal
        open={editProjectOpen}
        title="Edit project"
        description="Update project details. Team members and tasks remain unchanged."
        onClose={() => (editBusy ? null : setEditProjectOpen(false))}
      >
        <form onSubmit={saveProject} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="label">Title</div>
              <input className="input mt-1" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <div className="label">Deadline</div>
              <input type="date" className="input mt-1" value={editForm.deadline} onChange={(e) => setEditForm((p) => ({ ...p, deadline: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <div className="label">Description</div>
              <textarea rows={4} className="input mt-1" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          {editError ? <div className="text-sm text-rose-700">{editError}</div> : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" className="btn-danger" onClick={deleteProject} disabled={editBusy}>
              Delete project
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditProjectOpen(false)} disabled={editBusy}>
                Cancel
              </button>
              <button className="btn-primary" disabled={editBusy}>
                {editBusy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}


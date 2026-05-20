import { useEffect, useMemo, useState } from "react";

export function TaskForm({ users, projects, initialTask, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "Medium",
    status: "Todo",
    dueDate: "",
  }));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialTask) return;
    setForm({
      title: initialTask.title || "",
      description: initialTask.description || "",
      projectId: initialTask.projectId?._id || initialTask.projectId || "",
      assignedTo: initialTask.assignedTo?._id || initialTask.assignedTo || "",
      priority: initialTask.priority || "Medium",
      status: initialTask.status || "Todo",
      dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().slice(0, 10) : "",
    });
  }, [initialTask]);

  const submitLabel = initialTask ? "Update Task" : "Create Task";

  const availableUsers = useMemo(() => users || [], [users]);
  const availableProjects = useMemo(() => projects || [], [projects]);

  const projectTeamUsersById = useMemo(() => {
    const map = new Map();
    (availableProjects || []).forEach((p) => {
      const team = Array.isArray(p.teamMembers) ? p.teamMembers : null;
      if (team) map.set(String(p._id), team);
    });
    return map;
  }, [availableProjects]);

  const visibleUsers = useMemo(() => {
    const byProject = projectTeamUsersById.get(String(form.projectId));
    return Array.isArray(byProject) && byProject.length ? byProject : availableUsers;
  }, [availableUsers, projectTeamUsersById, form.projectId]);

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    if (!form.projectId) return;
    if (!form.assignedTo) return;
    const ok = visibleUsers.some((u) => String(u._id) === String(form.assignedTo));
    if (!ok) setForm((p) => ({ ...p, assignedTo: "" }));
  }, [form.projectId, visibleUsers, form.assignedTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Title is required");
    if (!form.projectId) return setError("Project is required");
    if (!form.assignedTo) return setError("Assigned user is required");
    if (!form.dueDate) return setError("Due date is required");
    await onSubmit?.({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: new Date(form.dueDate).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="label">Title</div>
          <input className="input mt-1" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
        </div>
        <div>
          <div className="label">Project</div>
          <select className="input mt-1" value={form.projectId} onChange={(e) => onChange("projectId", e.target.value)}>
            <option value="">Select project</option>
            {availableProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">Assign To</div>
          <select className="input mt-1" value={form.assignedTo} onChange={(e) => onChange("assignedTo", e.target.value)}>
            <option value="">Select user</option>
            {visibleUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email}) - {u.role}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-slate-500">User must already be on the project team.</div>
        </div>
        <div>
          <div className="label">Due Date</div>
          <input
            type="date"
            className="input mt-1"
            value={form.dueDate}
            onChange={(e) => onChange("dueDate", e.target.value)}
          />
        </div>
        <div>
          <div className="label">Priority</div>
          <select className="input mt-1" value={form.priority} onChange={(e) => onChange("priority", e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <div className="label">Status</div>
          <select className="input mt-1" value={form.status} onChange={(e) => onChange("status", e.target.value)}>
            <option>Todo</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <div className="label">Description</div>
          <textarea
            rows={3}
            className="input mt-1"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
      </div>

      {error ? <div className="mt-3 text-sm text-rose-700">{error}</div> : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { Project } = require("../models/Project");
const { Task } = require("../models/Task");
const { User } = require("../models/User");

async function assertUserOnProject(project, userId) {
  return project.teamMembers.some((m) => String(m) === String(userId));
}

async function createTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { title, description, projectId, assignedTo, priority, status, dueDate } = req.body;

  if (!mongoose.isValidObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });
  if (!mongoose.isValidObjectId(assignedTo)) return res.status(400).json({ message: "Invalid assignedTo" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const user = await User.findById(assignedTo).select("_id");
  if (!user) return res.status(404).json({ message: "Assigned user not found" });

  const onTeam = await assertUserOnProject(project, user._id);
  if (!onTeam) return res.status(400).json({ message: "Assigned user must be a member of the project team" });

  const task = await Task.create({
    title,
    description,
    projectId,
    assignedTo,
    priority,
    status,
    dueDate,
    createdBy: req.user._id,
  });

  const populated = await Task.findById(task._id)
    .populate("projectId", "_id title")
    .populate("assignedTo", "_id name email role")
    .populate("createdBy", "_id name email role");
  res.status(201).json({ task: populated });
}

async function listTasks(req, res) {
  const { projectId, status, overdue } = req.query;
  const filter = {};

  if (projectId) {
    if (!mongoose.isValidObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });
    filter.projectId = projectId;
  }

  if (status) filter.status = status;

  if (req.user.role !== "admin") {
    filter.assignedTo = req.user._id;
  }

  if (overdue === "true") {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: "Completed" };
  }

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .populate("projectId", "_id title")
    .populate("assignedTo", "_id name email role")
    .populate("createdBy", "_id name email role");
  res.json({ tasks });
}

async function getTask(req, res) {
  const { taskId } = req.params;
  if (!mongoose.isValidObjectId(taskId)) return res.status(400).json({ message: "Invalid taskId" });

  const task = await Task.findById(taskId)
    .populate("projectId", "_id title teamMembers createdBy")
    .populate("assignedTo", "_id name email role")
    .populate("createdBy", "_id name email role");
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.user.role !== "admin" && String(task.assignedTo?._id || task.assignedTo) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json({ task });
}

async function updateTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { taskId } = req.params;
  if (!mongoose.isValidObjectId(taskId)) return res.status(400).json({ message: "Invalid taskId" });

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const { title, description, assignedTo, priority, status, dueDate } = req.body;

  if (assignedTo !== undefined) {
    if (!mongoose.isValidObjectId(assignedTo)) return res.status(400).json({ message: "Invalid assignedTo" });
    const project = await Project.findById(task.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const user = await User.findById(assignedTo).select("_id");
    if (!user) return res.status(404).json({ message: "Assigned user not found" });
    const onTeam = await assertUserOnProject(project, user._id);
    if (!onTeam) return res.status(400).json({ message: "Assigned user must be a member of the project team" });
    task.assignedTo = assignedTo;
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();
  const populated = await Task.findById(task._id)
    .populate("projectId", "_id title")
    .populate("assignedTo", "_id name email role")
    .populate("createdBy", "_id name email role");
  res.json({ task: populated });
}

async function deleteTask(req, res) {
  const { taskId } = req.params;
  if (!mongoose.isValidObjectId(taskId)) return res.status(400).json({ message: "Invalid taskId" });

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  await task.deleteOne();
  res.json({ message: "Task deleted" });
}

async function updateMyTaskStatus(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { taskId } = req.params;
  const { status } = req.body;
  if (!mongoose.isValidObjectId(taskId)) return res.status(400).json({ message: "Invalid taskId" });

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (String(task.assignedTo) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  task.status = status;
  await task.save();

  const populated = await Task.findById(task._id)
    .populate("projectId", "_id title")
    .populate("assignedTo", "_id name email role");
  res.json({ task: populated });
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask, updateMyTaskStatus };


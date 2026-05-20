const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { Project } = require("../models/Project");
const { User } = require("../models/User");

function canManageProject(user, project) {
  if (user.role === "admin") return true;
  return String(project.createdBy) === String(user._id);
}

async function createProject(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { title, description, deadline, teamMembers } = req.body;
  const memberIds = Array.isArray(teamMembers) ? teamMembers : [];
  const uniqueIds = [...new Set(memberIds.map(String))].filter(Boolean);

  const validUsers = await User.find({ _id: { $in: uniqueIds } }).select("_id");
  const validIds = new Set(validUsers.map((u) => String(u._id)));

  const cleaned = uniqueIds.filter((id) => validIds.has(id));
  if (!cleaned.includes(String(req.user._id))) cleaned.push(String(req.user._id));

  const project = await Project.create({
    title,
    description,
    deadline,
    teamMembers: cleaned,
    createdBy: req.user._id,
  });

  const populated = await Project.findById(project._id)
    .populate("createdBy", "_id name email role")
    .populate("teamMembers", "_id name email role");
  res.status(201).json({ project: populated });
}

async function listProjects(req, res) {
  const filter =
    req.user.role === "admin"
      ? {}
      : {
          teamMembers: req.user._id,
        };

  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "_id name email role")
    .populate("teamMembers", "_id name email role");
  res.json({ projects });
}

async function getProject(req, res) {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });

  const project = await Project.findById(projectId)
    .populate("createdBy", "_id name email role")
    .populate("teamMembers", "_id name email role");
  if (!project) return res.status(404).json({ message: "Project not found" });

  const isMember = project.teamMembers.some((m) => String(m._id || m) === String(req.user._id));
  if (req.user.role !== "admin" && !isMember) return res.status(403).json({ message: "Forbidden" });

  res.json({ project });
}

async function updateProject(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!canManageProject(req.user, project)) return res.status(403).json({ message: "Forbidden" });

  const { title, description, deadline } = req.body;
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (deadline !== undefined) project.deadline = deadline;
  await project.save();

  const populated = await Project.findById(project._id)
    .populate("createdBy", "_id name email role")
    .populate("teamMembers", "_id name email role");
  res.json({ project: populated });
}

async function deleteProject(req, res) {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!canManageProject(req.user, project)) return res.status(403).json({ message: "Forbidden" });

  await project.deleteOne();
  res.json({ message: "Project deleted" });
}

async function addMember(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { projectId } = req.params;
  const { userId } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!canManageProject(req.user, project)) return res.status(403).json({ message: "Forbidden" });

  const user = await User.findById(userId).select("_id");
  if (!user) return res.status(404).json({ message: "User not found" });

  const exists = project.teamMembers.some((id) => String(id) === String(user._id));
  if (!exists) project.teamMembers.push(user._id);
  await project.save();

  const populated = await Project.findById(project._id).populate("teamMembers", "_id name email role");
  res.json({ project: populated });
}

async function removeMember(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { projectId } = req.params;
  const { userId } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!canManageProject(req.user, project)) return res.status(403).json({ message: "Forbidden" });

  if (String(userId) === String(project.createdBy)) {
    return res.status(400).json({ message: "Cannot remove project creator" });
  }

  project.teamMembers = project.teamMembers.filter((id) => String(id) !== String(userId));
  await project.save();

  const populated = await Project.findById(project._id).populate("teamMembers", "_id name email role");
  res.json({ project: populated });
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};


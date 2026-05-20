const { Project } = require("../models/Project");
const { Task } = require("../models/Task");

async function getDashboard(req, res) {
  const now = new Date();

  const projectFilter = req.user.role === "admin" ? {} : { teamMembers: req.user._id };
  const taskFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

  const [totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks, tasksByStatus] = await Promise.all([
    Project.countDocuments(projectFilter),
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: "Completed" }),
    Task.countDocuments({ ...taskFilter, status: { $ne: "Completed" } }),
    Task.countDocuments({ ...taskFilter, dueDate: { $lt: now }, status: { $ne: "Completed" } }),
    Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
  ]);

  res.json({
    stats: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus,
    },
  });
}

module.exports = { getDashboard };


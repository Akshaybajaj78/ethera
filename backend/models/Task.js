const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium", index: true },
    status: { type: String, enum: ["Todo", "In Progress", "Completed"], default: "Todo", index: true },
    dueDate: { type: Date, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };


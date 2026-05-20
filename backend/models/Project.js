const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    deadline: { type: Date, required: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

projectSchema.index({ createdBy: 1, deadline: 1 });

const Project = mongoose.model("Project", projectSchema);

module.exports = { Project };


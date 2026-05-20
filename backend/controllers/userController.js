const { validationResult } = require("express-validator");
const { User } = require("../models/User");

async function listUsers(req, res) {
  const q = (req.query.q || "").toString().trim();
  const filter = q
    ? {
        $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }],
      }
    : {};

  const users = await User.find(filter).select("_id name email role").sort({ createdAt: -1 }).limit(50);
  res.json({ users });
}

async function updateUserRole(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

  const { userId } = req.params;
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("_id name email role");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
}

module.exports = { listUsers, updateUserRole };


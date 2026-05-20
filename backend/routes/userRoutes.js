const express = require("express");
const { body, param } = require("express-validator");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { listUsers, updateUserRole } = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, allowRoles("admin"), asyncHandler(listUsers));

router.patch(
  "/:userId/role",
  [
    authMiddleware,
    allowRoles("admin"),
    param("userId").isMongoId(),
    body("role").isIn(["admin", "member"]),
  ],
  asyncHandler(updateUserRole)
);

module.exports = { userRoutes: router };


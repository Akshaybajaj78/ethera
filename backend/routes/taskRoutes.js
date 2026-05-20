const express = require("express");
const { body, param, query } = require("express-validator");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  updateMyTaskStatus,
} = require("../controllers/taskController");

const router = express.Router();

router.get(
  "/",
  [
    authMiddleware,
    query("projectId").optional().isMongoId(),
    query("status").optional().isIn(["Todo", "In Progress", "Completed"]),
    query("overdue").optional().isIn(["true", "false"]),
  ],
  asyncHandler(listTasks)
);

router.get("/:taskId", authMiddleware, [param("taskId").isMongoId()], asyncHandler(getTask));

router.post(
  "/",
  [
    authMiddleware,
    allowRoles("admin"),
    body("title").isString().trim().isLength({ min: 2, max: 160 }),
    body("description").optional().isString().trim().isLength({ max: 4000 }),
    body("projectId").isMongoId(),
    body("assignedTo").isMongoId(),
    body("priority").optional().isIn(["Low", "Medium", "High"]),
    body("status").optional().isIn(["Todo", "In Progress", "Completed"]),
    body("dueDate").isISO8601().toDate(),
  ],
  asyncHandler(createTask)
);

router.patch(
  "/:taskId",
  [
    authMiddleware,
    allowRoles("admin"),
    param("taskId").isMongoId(),
    body("title").optional().isString().trim().isLength({ min: 2, max: 160 }),
    body("description").optional().isString().trim().isLength({ max: 4000 }),
    body("assignedTo").optional().isMongoId(),
    body("priority").optional().isIn(["Low", "Medium", "High"]),
    body("status").optional().isIn(["Todo", "In Progress", "Completed"]),
    body("dueDate").optional().isISO8601().toDate(),
  ],
  asyncHandler(updateTask)
);

router.delete("/:taskId", authMiddleware, allowRoles("admin"), [param("taskId").isMongoId()], asyncHandler(deleteTask));

router.patch(
  "/:taskId/my-status",
  [authMiddleware, param("taskId").isMongoId(), body("status").isIn(["Todo", "In Progress", "Completed"])],
  asyncHandler(updateMyTaskStatus)
);

module.exports = { taskRoutes: router };


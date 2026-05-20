const express = require("express");
const { body, param } = require("express-validator");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(listProjects));
router.get("/:projectId", authMiddleware, [param("projectId").isMongoId()], asyncHandler(getProject));

router.post(
  "/",
  [
    authMiddleware,
    allowRoles("admin"),
    body("title").isString().trim().isLength({ min: 2, max: 120 }),
    body("description").optional().isString().trim().isLength({ max: 2000 }),
    body("deadline").isISO8601().toDate(),
    body("teamMembers").optional().isArray(),
    body("teamMembers.*").optional().isMongoId(),
  ],
  asyncHandler(createProject)
);

router.patch(
  "/:projectId",
  [
    authMiddleware,
    param("projectId").isMongoId(),
    body("title").optional().isString().trim().isLength({ min: 2, max: 120 }),
    body("description").optional().isString().trim().isLength({ max: 2000 }),
    body("deadline").optional().isISO8601().toDate(),
  ],
  asyncHandler(updateProject)
);

router.delete("/:projectId", authMiddleware, [param("projectId").isMongoId()], asyncHandler(deleteProject));

router.post(
  "/:projectId/members/add",
  [authMiddleware, allowRoles("admin"), param("projectId").isMongoId(), body("userId").isMongoId()],
  asyncHandler(addMember)
);

router.post(
  "/:projectId/members/remove",
  [authMiddleware, allowRoles("admin"), param("projectId").isMongoId(), body("userId").isMongoId()],
  asyncHandler(removeMember)
);

module.exports = { projectRoutes: router };


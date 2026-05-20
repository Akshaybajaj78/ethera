const express = require("express");
const { body } = require("express-validator");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authMiddleware } = require("../middleware/authMiddleware");
const { signup, login, me } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6, max: 128 }),
    body("role").optional().isIn(["admin", "member"]),
  ],
  asyncHandler(signup)
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").isString().isLength({ min: 6, max: 128 })],
  asyncHandler(login)
);

router.get("/me", authMiddleware, asyncHandler(me));

module.exports = { authRoutes: router };


import { Router } from "express";
import { body } from "express-validator";
import { register, login, me } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { isStrongPassword } from "../utils/validators";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 255 })
      .withMessage("Name must be between 2 and 255 characters"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .custom((value) => isStrongPassword(value))
      .withMessage(
        "Password must contain at least 1 uppercase letter, 1 number, and 1 special character (@$!%*?&)"
      ),
  ],
  register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// GET /api/auth/me (needs token)
router.get("/me", requireAuth, me);

export default router;

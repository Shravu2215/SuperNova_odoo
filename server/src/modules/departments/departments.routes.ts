import { Router } from "express";
import { createDepartment, updateDepartment, getDepartments } from "./departments.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createDepartmentSchema, updateDepartmentSchema } from "./departments.schema";

const router = Router();

// Public: the signup form needs to list departments before the user is authenticated.
router.get("/", getDepartments);

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), validate(createDepartmentSchema), createDepartment);
router.patch("/:id", requireRole("ADMIN"), validate(updateDepartmentSchema), updateDepartment);

export default router;

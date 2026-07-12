import { Router } from "express";
import { createDepartment, updateDepartment, getDepartments } from "./departments.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createDepartmentSchema, updateDepartmentSchema } from "./departments.schema";

const router = Router();

router.use(requireAuth);

router.get("/", getDepartments);

router.post("/", requireRole("ADMIN"), validate(createDepartmentSchema), createDepartment);
router.patch("/:id", requireRole("ADMIN"), validate(updateDepartmentSchema), updateDepartment);

export default router;

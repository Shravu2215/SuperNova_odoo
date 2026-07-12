import { Router } from "express";
import { getEmployees, updateRole } from "./employees.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { listEmployeesSchema, updateRoleSchema } from "./employees.schema";

const router = Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/", validate(listEmployeesSchema, "query"), getEmployees);
router.patch("/:id/role", validate(updateRoleSchema, "body"), updateRole);

export default router;

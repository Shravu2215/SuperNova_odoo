import { Router } from "express";
import { getMetrics } from "./dashboard.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();

router.use(requireAuth);

router.get("/metrics", requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getMetrics);

export default router;

import { Router } from "express";
import { getLogs } from "./activityLogs.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "ASSET_MANAGER"), getLogs);

export default router;

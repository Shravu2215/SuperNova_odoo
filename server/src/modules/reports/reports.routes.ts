import { Router } from "express";
import { getAssetReport, getAuditReport } from "./reports.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

const router = Router();

router.use(requireAuth);
router.use(requireRole("ADMIN", "ASSET_MANAGER"));

router.get("/assets", getAssetReport);
router.get("/audits", getAuditReport);

export default router;

import { Router } from "express";
import { createAuditCycle, assignAudits, submitAuditResult, getAuditCycles, getMyAudits } from "./audits.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createAuditCycleSchema, assignAuditSchema, submitAuditSchema } from "./audits.schema";

const router = Router();

router.use(requireAuth);

router.get("/cycles", requireRole("ADMIN", "ASSET_MANAGER"), getAuditCycles);
router.post("/cycles", requireRole("ADMIN", "ASSET_MANAGER"), validate(createAuditCycleSchema), createAuditCycle);
router.post("/cycles/:id/assignments", requireRole("ADMIN", "ASSET_MANAGER"), validate(assignAuditSchema), assignAudits);

router.get("/my", getMyAudits);
router.put("/assignments/:id", validate(submitAuditSchema), submitAuditResult);

export default router;

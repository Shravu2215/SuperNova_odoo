import { Router } from "express";
import { reportMaintenance, updateMaintenanceStatus, getMaintenanceRecords } from "./maintenance.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createMaintenanceSchema, updateMaintenanceSchema } from "./maintenance.schema";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "ASSET_MANAGER"), getMaintenanceRecords);
router.post("/", validate(createMaintenanceSchema), reportMaintenance);
router.patch("/:id", requireRole("ADMIN", "ASSET_MANAGER"), validate(updateMaintenanceSchema), updateMaintenanceStatus);

export default router;

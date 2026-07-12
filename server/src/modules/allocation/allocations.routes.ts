import { Router } from "express";
import { allocateAsset, requestTransfer, approveAllocation, returnAsset, getAllocations, getMyAllocations } from "./allocations.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { allocateAssetSchema, requestTransferSchema, returnAssetSchema } from "./allocations.schema";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getAllocations);
router.get("/my", getMyAllocations);

router.post("/", validate(allocateAssetSchema), allocateAsset);
router.post("/:id/transfer", validate(requestTransferSchema), requestTransfer);
router.put("/:id/approve", requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), approveAllocation);
router.put("/:id/return", validate(returnAssetSchema), returnAsset);

export default router;

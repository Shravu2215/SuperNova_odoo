import { Router } from "express";
import { createAsset, getAssets, getAssetDetail, updateAsset } from "./assets.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createAssetSchema, updateAssetSchema, queryAssetsSchema } from "./assets.schema";

const router = Router();

router.use(requireAuth);

router.get("/", validate(queryAssetsSchema, "query"), getAssets);
router.get("/:id", getAssetDetail);

router.post("/", requireRole("ADMIN", "ASSET_MANAGER"), validate(createAssetSchema), createAsset);
router.patch("/:id", requireRole("ADMIN", "ASSET_MANAGER"), validate(updateAssetSchema), updateAsset);

export default router;

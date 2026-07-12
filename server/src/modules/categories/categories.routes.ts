import { Router } from "express";
import { createCategory, updateCategory, getCategories } from "./categories.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";

const router = Router();

router.use(requireAuth);

router.get("/", getCategories);

router.post("/", requireRole("ADMIN"), validate(createCategorySchema), createCategory);
router.patch("/:id", requireRole("ADMIN"), validate(updateCategorySchema), updateCategory);

export default router;

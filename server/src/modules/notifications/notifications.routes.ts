import { Router } from "express";
import { getMyNotifications, markAsRead } from "./notifications.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/my", getMyNotifications);
router.patch("/:id/read", markAsRead);

export default router;

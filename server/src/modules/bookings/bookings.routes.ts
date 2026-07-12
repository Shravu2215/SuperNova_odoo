import { Router } from "express";
import { createBooking, updateBookingStatus, getAllBookings, getMyBookings } from "./bookings.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createBookingSchema, updateBookingStatusSchema } from "./bookings.schema";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getAllBookings);
router.get("/my", getMyBookings);

router.post("/", validate(createBookingSchema), createBooking);
router.patch("/:id/status", validate(updateBookingStatusSchema), updateBookingStatus);

export default router;

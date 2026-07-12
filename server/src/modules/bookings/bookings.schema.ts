import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const createBookingSchema = z.object({
  assetId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  purpose: z.string().optional(),
}).strict().refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: "Start time must be before end time",
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CANCELLED", "COMPLETED", "CONFIRMED", "PENDING"]),
}).strict();

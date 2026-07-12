import { z } from "zod";
import { MaintenanceStatus } from "@prisma/client";

export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1),
  description: z.string().min(1),
  scheduledDate: z.string().datetime().optional(),
}).strict();

export const updateMaintenanceSchema = z.object({
  status: z.nativeEnum(MaintenanceStatus).optional(),
  cost: z.number().optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  description: z.string().optional(),
}).strict();

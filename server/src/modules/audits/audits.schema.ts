import { z } from "zod";

export const createAuditCycleSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).strict();

export const assignAuditSchema = z.object({
  assignments: z.array(z.object({
    assetId: z.string().min(1),
    assignedToId: z.string().min(1)
  })).min(1),
}).strict();

export const submitAuditSchema = z.object({
  status: z.enum(["VERIFIED", "DISCREPANCY"]),
  notes: z.string().optional(),
}).strict();

import { z } from "zod";
import { AuditAssignmentStatus } from "@prisma/client";

export const createAuditCycleSchema = z.object({
  scopeDeptId: z.string().optional().nullable(),
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
  status: z.enum([AuditAssignmentStatus.VERIFIED, AuditAssignmentStatus.MISSING, AuditAssignmentStatus.DAMAGED]),
  notes: z.string().optional(),
}).strict();

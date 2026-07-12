import { z } from "zod";
import { DepartmentStatus } from "@prisma/client";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2),
  parentDeptId: z.string().optional(),
}).strict();

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(2).optional(),
  parentDeptId: z.string().optional().nullable(),
  status: z.nativeEnum(DepartmentStatus).optional(),
}).strict();

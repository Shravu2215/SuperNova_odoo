import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

export const listEmployeesSchema = z.object({
  deptId: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
}).strict();

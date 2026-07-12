import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[@$!%*?&]/, "Password must contain a special character (@$!%*?&)"),
    deptId: z.string().min(1, "Department ID is required"),
    role: z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

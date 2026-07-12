import { z } from "zod";

export const allocateAssetSchema = z.object({
  assetId: z.string().min(1),
  allocatedToEmployeeId: z.string().optional().nullable(),
  allocatedToDeptId: z.string().optional().nullable(),
  expectedReturnDate: z.string().datetime().optional().nullable(),
}).strict().refine(data => data.allocatedToEmployeeId || data.allocatedToDeptId, {
  message: "Must allocate to either an employee or a department",
});

export const requestTransferSchema = z.object({
  newEmployeeId: z.string().min(1),
}).strict();

export const returnAssetSchema = z.object({
  actualReturnDate: z.string().datetime().optional(),
  returnConditionNotes: z.string().optional(),
}).strict();

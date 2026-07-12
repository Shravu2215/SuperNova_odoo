import { z } from "zod";
import { AssetCondition } from "@prisma/client";

export const createAssetSchema = z.object({
  serialNumber: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  condition: z.nativeEnum(AssetCondition).optional(),
  location: z.string().optional().nullable(),
  isShareable: z.boolean().optional(),
  acquiredDate: z.string().datetime().optional().nullable(),
  acquiredCost: z.number().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
}).strict();

export const updateAssetSchema = z.object({
  serialNumber: z.string().optional().nullable(),
  categoryId: z.string().optional(),
  condition: z.nativeEnum(AssetCondition).optional(),
  location: z.string().optional().nullable(),
  isShareable: z.boolean().optional(),
  acquiredDate: z.string().datetime().optional().nullable(),
  acquiredCost: z.number().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
}).strict();

export const queryAssetsSchema = z.object({
  status: z.string().optional(),
  categoryId: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

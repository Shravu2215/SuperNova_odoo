import { z } from "zod";

export const customFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "date"]),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2),
  customFields: z.array(customFieldSchema).optional(),
}).strict();

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).optional(),
  customFields: z.array(customFieldSchema).optional(),
}).strict();

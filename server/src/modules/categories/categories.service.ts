import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";

export async function createCategory(input: { name: string; customFields?: any }) {
  const existing = await prisma.assetCategory.findUnique({ where: { name: input.name } });
  if (existing) throw new AppError(409, "CONFLICT", "Category name already exists");

  return prisma.assetCategory.create({ data: input });
}

export async function updateCategory(id: string, input: { name?: string; customFields?: any }) {
  const cat = await prisma.assetCategory.findUnique({ where: { id } });
  if (!cat) throw new AppError(404, "NOT_FOUND", "Category not found");

  if (input.name && input.name !== cat.name) {
    const existing = await prisma.assetCategory.findUnique({ where: { name: input.name } });
    if (existing) throw new AppError(409, "CONFLICT", "Category name already exists");
  }

  return prisma.assetCategory.update({ where: { id }, data: input });
}

export async function listCategories() {
  return prisma.assetCategory.findMany();
}

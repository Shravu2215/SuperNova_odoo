import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";

export async function createDepartment(input: { name: string; parentDeptId?: string }) {
  const existing = await prisma.department.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new AppError(409, "CONFLICT", "Department name already exists");
  }

  if (input.parentDeptId) {
    const parent = await prisma.department.findUnique({ where: { id: input.parentDeptId } });
    if (!parent) {
      throw new AppError(400, "INVALID_INPUT", "Parent department does not exist");
    }
  }

  return prisma.department.create({ data: input });
}

export async function updateDepartment(id: string, input: { name?: string; parentDeptId?: string | null; status?: any }) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new AppError(404, "NOT_FOUND", "Department not found");

  if (input.name && input.name !== dept.name) {
    const existing = await prisma.department.findUnique({ where: { name: input.name } });
    if (existing) throw new AppError(409, "CONFLICT", "Department name already exists");
  }

  if (input.parentDeptId) {
    if (input.parentDeptId === id) {
      throw new AppError(400, "INVALID_INPUT", "Department cannot be its own parent");
    }
    const parent = await prisma.department.findUnique({ where: { id: input.parentDeptId } });
    if (!parent) throw new AppError(400, "INVALID_INPUT", "Parent department does not exist");
    
    // Check circular reference (1 level for MVP)
    if (parent.parentDeptId === id) {
      throw new AppError(400, "INVALID_INPUT", "Circular parent reference detected");
    }
  }

  return prisma.department.update({ where: { id }, data: input });
}

export async function listDepartments() {
  return prisma.department.findMany({
    include: { childDepts: true },
    where: { parentDeptId: null }
  });
}

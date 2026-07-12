import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { logActivity } from "../../utils/activityLogger";
import { notify } from "../notifications/notifications.service";
import { UserRole, NotificationType } from "@prisma/client";
import { SafeEmployee } from "../auth/auth.types";

function toSafeEmployee(employee: any): SafeEmployee {
  return { id: employee.id, name: employee.name, email: employee.email, role: employee.role, deptId: employee.deptId, createdAt: employee.createdAt };
}

export async function listEmployees(filters: { deptId?: string; role?: UserRole; status?: any; page?: number; limit?: number }) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.deptId) where.deptId = filters.deptId;
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;

  const [total, items] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({ where, skip, take: limit })
  ]);

  return { total, page, limit, items: items.map(toSafeEmployee) };
}

export async function updateEmployeeRole(id: string, newRole: UserRole, actorId: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw new AppError(404, "NOT_FOUND", "Employee not found");

  if (employee.id === actorId && employee.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
    const adminCount = await prisma.employee.count({ where: { role: UserRole.ADMIN, status: "ACTIVE" } });
    if (adminCount <= 1) {
      throw new AppError(400, "BAD_REQUEST", "Cannot demote the last remaining Admin");
    }
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { role: newRole }
  });

  await logActivity(actorId, "ROLE_CHANGED", "EMPLOYEE", id, { oldRole: employee.role, newRole });
  
  if (employee.id !== actorId) {
    await notify(id, NotificationType.ASSET_ASSIGNED, `Your role has been updated to ${newRole}`);
  }

  return toSafeEmployee(updated);
}

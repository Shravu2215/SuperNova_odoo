import { prisma } from "../config/prisma";

export async function logActivity(
  employeeId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: any
) {
  return prisma.activityLog.create({
    data: {
      employeeId,
      action,
      entityType,
      entityId,
      details: details || {},
    },
  });
}

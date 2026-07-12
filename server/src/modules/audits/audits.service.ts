import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { logActivity } from "../../utils/activityLogger";
import { AuditAssignmentStatus, NotificationType } from "@prisma/client";
import { notify } from "../notifications/notifications.service";

export async function createAuditCycle(input: any) {
  return prisma.auditCycle.create({ data: input });
}

export async function assignAudits(cycleId: string, assignments: { assetId: string, assignedToId: string }[]) {
  return prisma.$transaction(async (tx) => {
    const cycle = await tx.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new AppError(404, "NOT_FOUND", "Audit cycle not found");

    const created = await Promise.all(assignments.map(async (a) => {
      const assignment = await tx.auditAssignment.create({
        data: {
          cycleId,
          assetId: a.assetId,
          assignedToId: a.assignedToId,
        }
      });
      return assignment;
    }));
    return created;
  }).then(async (res) => {
    const byUser = res.reduce((acc, curr) => {
      acc[curr.assignedToId] = (acc[curr.assignedToId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    for (const [userId, count] of Object.entries(byUser)) {
       await notify(userId, NotificationType.AUDIT_DISCREPANCY, `You have been assigned ${count} assets for audit.`);
    }
    return res;
  });
}

export async function submitAuditResult(assignmentId: string, employeeId: string, status: AuditAssignmentStatus, notes?: string) {
  const assignment = await prisma.auditAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new AppError(404, "NOT_FOUND", "Assignment not found");
  if (assignment.assignedToId !== employeeId) throw new AppError(403, "FORBIDDEN", "Not assigned to you");

  const updated = await prisma.auditAssignment.update({
    where: { id: assignmentId },
    data: { status, notes, completedAt: new Date() }
  });

  await logActivity(employeeId, `AUDIT_${status}`, "ASSET", assignment.assetId, { assignmentId });
  return updated;
}

export async function listAuditCycles() {
  return prisma.auditCycle.findMany({ include: { assignments: true }, orderBy: { createdAt: "desc" }});
}

export async function getMyAudits(employeeId: string) {
  return prisma.auditAssignment.findMany({
    where: { assignedToId: employeeId, status: AuditAssignmentStatus.PENDING },
    include: { asset: true, cycle: true }
  });
}

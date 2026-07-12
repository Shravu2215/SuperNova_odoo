import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { logActivity } from "../../utils/activityLogger";
import { MaintenanceStatus, AssetStatus, NotificationType } from "@prisma/client";
import { emitGlobal, SocketEvent } from "../../sockets/events";
import { getIO } from "../../config/socket";
import { notify } from "../notifications/notifications.service";

export async function reportMaintenance(employeeId: string, input: any) {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: input.assetId } });
    if (!asset) throw new AppError(404, "NOT_FOUND", "Asset not found");

    const record = await tx.maintenanceRequest.create({
      data: {
        assetId: input.assetId,
        raisedByEmployeeId: employeeId,
        description: input.description,
        priority: "MEDIUM",
      }
    });

    await tx.asset.update({ where: { id: input.assetId }, data: { status: AssetStatus.UNDER_MAINTENANCE } });
    await logActivity(employeeId, "MAINTENANCE_REPORTED", "ASSET", input.assetId, { maintenanceId: record.id });
    return record;
  }).then(async (res) => {
    try {
      const io = getIO();
      emitGlobal(io, SocketEvent.ASSET_UPDATED, { assetId: input.assetId, status: AssetStatus.UNDER_MAINTENANCE });
    } catch {}
    return res;
  });
}

export async function updateMaintenanceStatus(id: string, actorId: string, input: any) {
  return await prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceRequest.findUnique({ where: { id } });
    if (!record) throw new AppError(404, "NOT_FOUND", "Maintenance record not found");

    const data: any = {};
    if (input.status) data.status = input.status;
    if (input.description) data.description = input.description;
    if (input.completedDate) data.completedAt = new Date(input.completedDate);
    if (input.technician) data.technician = input.technician;
    if (input.resolutionNotes) data.resolutionNotes = input.resolutionNotes;

    const updated = await tx.maintenanceRequest.update({
      where: { id },
      data
    });

    if (input.status === MaintenanceStatus.RESOLVED || input.status === MaintenanceStatus.REJECTED) {
      const allocation = await tx.assetAllocation.findFirst({
        where: { assetId: record.assetId, status: "ALLOCATED" }
      });
      const newStatus = allocation ? AssetStatus.ALLOCATED : AssetStatus.AVAILABLE;
      await tx.asset.update({ where: { id: record.assetId }, data: { status: newStatus } });
    }

    await logActivity(actorId, `MAINTENANCE_${input.status || "UPDATED"}`, "ASSET", record.assetId, { maintenanceId: id });
    return updated;
  }).then(async (res) => {
    if (input.status === MaintenanceStatus.RESOLVED) {
      await notify(res.raisedByEmployeeId, NotificationType.MAINTENANCE_APPROVED, `Maintenance completed for asset ${res.assetId}`);
    } else if (input.status === MaintenanceStatus.REJECTED) {
      await notify(res.raisedByEmployeeId, NotificationType.MAINTENANCE_REJECTED, `Maintenance cancelled for asset ${res.assetId}`);
    }
    
    try {
      const io = getIO();
      if (input.status === MaintenanceStatus.RESOLVED || input.status === MaintenanceStatus.REJECTED) {
         emitGlobal(io, SocketEvent.ASSET_UPDATED, { assetId: res.assetId });
      }
    } catch {}
    
    return res;
  });
}

export async function listMaintenance(filters: any) {
  const where: any = {};
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.status) where.status = filters.status;

  return prisma.maintenanceRequest.findMany({ 
    where,
    include: { asset: true, raisedByEmployee: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
}

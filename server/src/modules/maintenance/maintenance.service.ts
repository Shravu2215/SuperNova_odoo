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

    const record = await tx.maintenanceRecord.create({
      data: {
        assetId: input.assetId,
        reportedById: employeeId,
        description: input.description,
        scheduledDate: input.scheduledDate,
      }
    });

    await tx.asset.update({ where: { id: input.assetId }, data: { status: AssetStatus.MAINTENANCE } });
    await logActivity(employeeId, "MAINTENANCE_REPORTED", "ASSET", input.assetId, { maintenanceId: record.id });
    return record;
  }).then(async (res) => {
    try {
      const io = getIO();
      emitGlobal(io, SocketEvent.ASSET_UPDATED, { assetId: input.assetId, status: AssetStatus.MAINTENANCE });
    } catch {}
    return res;
  });
}

export async function updateMaintenanceStatus(id: string, actorId: string, input: any) {
  return await prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new AppError(404, "NOT_FOUND", "Maintenance record not found");

    const updated = await tx.maintenanceRecord.update({
      where: { id },
      data: input
    });

    if (input.status === MaintenanceStatus.COMPLETED || input.status === MaintenanceStatus.CANCELLED) {
      const allocation = await tx.assetAllocation.findFirst({
        where: { assetId: record.assetId, status: "ALLOCATED" }
      });
      const newStatus = allocation ? AssetStatus.ALLOCATED : AssetStatus.AVAILABLE;
      await tx.asset.update({ where: { id: record.assetId }, data: { status: newStatus } });
    }

    await logActivity(actorId, `MAINTENANCE_${input.status || "UPDATED"}`, "ASSET", record.assetId, { maintenanceId: id });
    return updated;
  }).then(async (res) => {
    if (input.status === MaintenanceStatus.COMPLETED) {
      await notify(res.reportedById, NotificationType.MAINTENANCE_APPROVED, `Maintenance completed for asset ${res.assetId}`);
    } else if (input.status === MaintenanceStatus.CANCELLED) {
      await notify(res.reportedById, NotificationType.MAINTENANCE_REJECTED, `Maintenance cancelled for asset ${res.assetId}`);
    }
    
    try {
      const io = getIO();
      if (input.status === MaintenanceStatus.COMPLETED || input.status === MaintenanceStatus.CANCELLED) {
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

  return prisma.maintenanceRecord.findMany({ 
    where,
    include: { asset: true, reportedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
}

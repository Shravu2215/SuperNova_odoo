import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { logActivity } from "../../utils/activityLogger";
import { notify } from "../notifications/notifications.service";
import { AssetStatus, AllocationStatus, UserRole, NotificationType } from "@prisma/client";
import { emitGlobal, SocketEvent } from "../../sockets/events";
import { getIO } from "../../config/socket";

export async function allocateAsset(actorId: string, actorRole: UserRole, input: any) {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: input.assetId } });
    if (!asset || asset.status !== AssetStatus.AVAILABLE) {
      throw new AppError(409, "ASSET_UNAVAILABLE", "Asset is not available for allocation");
    }

    const isAutoApproved = actorRole === UserRole.ADMIN || actorRole === UserRole.ASSET_MANAGER;
    const finalStatus = isAutoApproved ? AllocationStatus.ALLOCATED : AllocationStatus.PENDING_APPROVAL;
    const finalAssetStatus = isAutoApproved ? AssetStatus.ALLOCATED : AssetStatus.RESERVED;

    const allocation = await tx.assetAllocation.create({
      data: {
        assetId: input.assetId,
        allocatedToEmployeeId: input.allocatedToEmployeeId,
        allocatedToDeptId: input.allocatedToDeptId,
        expectedReturnDate: input.expectedReturnDate,
        status: finalStatus,
      }
    });

    await tx.asset.update({
      where: { id: input.assetId },
      data: { status: finalAssetStatus }
    });

    await logActivity(actorId, isAutoApproved ? "ASSET_ALLOCATED" : "ALLOCATION_REQUESTED", "ASSET", input.assetId, { allocationId: allocation.id });
    return { allocation, finalStatus };
  }).then(async (res) => {
    if (res.finalStatus === AllocationStatus.ALLOCATED && input.allocatedToEmployeeId) {
      await notify(input.allocatedToEmployeeId, NotificationType.ASSET_ASSIGNED, `Asset ${input.assetId} allocated to you`);
    }
    const io = getIO();
    if (io) emitGlobal(io, SocketEvent.ASSET_UPDATED, { assetId: input.assetId, status: res.finalStatus === AllocationStatus.ALLOCATED ? AssetStatus.ALLOCATED : AssetStatus.RESERVED });
    return res.allocation;
  });
}

export async function requestTransfer(id: string, actorId: string, newEmployeeId: string) {
  return await prisma.$transaction(async (tx) => {
    const alloc = await tx.assetAllocation.findUnique({ where: { id } });
    if (!alloc || alloc.status !== AllocationStatus.ALLOCATED) {
      throw new AppError(400, "INVALID_STATE", "Only allocated assets can be transferred");
    }
    
    const newAlloc = await tx.assetAllocation.create({
      data: {
        assetId: alloc.assetId,
        allocatedToEmployeeId: newEmployeeId,
        status: AllocationStatus.TRANSFER_REQUESTED,
      }
    });

    await logActivity(actorId, "TRANSFER_REQUESTED", "ASSET", alloc.assetId, { fromAlloc: alloc.id, toAlloc: newAlloc.id });
    return newAlloc;
  });
}

export async function approveAllocation(id: string, actorId: string, actorRole: UserRole) {
  if (actorRole !== UserRole.ADMIN && actorRole !== UserRole.ASSET_MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Only managers can approve allocations");
  }

  return await prisma.$transaction(async (tx) => {
    const alloc = await tx.assetAllocation.findUnique({ where: { id } });
    if (!alloc || (alloc.status !== AllocationStatus.PENDING_APPROVAL && alloc.status !== AllocationStatus.TRANSFER_REQUESTED)) {
      throw new AppError(400, "INVALID_STATE", "Allocation not pending approval");
    }

    if (alloc.status === AllocationStatus.TRANSFER_REQUESTED) {
      await tx.assetAllocation.updateMany({
        where: { assetId: alloc.assetId, status: AllocationStatus.ALLOCATED, id: { not: id } },
        data: { status: AllocationStatus.RETURNED, actualReturnDate: new Date() }
      });
    }

    const updated = await tx.assetAllocation.update({
      where: { id },
      data: { status: AllocationStatus.ALLOCATED }
    });

    await tx.asset.update({
      where: { id: alloc.assetId },
      data: { status: AssetStatus.ALLOCATED }
    });

    await logActivity(actorId, "ALLOCATION_APPROVED", "ASSET", alloc.assetId, { allocationId: id });
    return updated;
  }).then(async (res) => {
    if (res.allocatedToEmployeeId) {
      await notify(res.allocatedToEmployeeId, NotificationType.TRANSFER_APPROVED, `Allocation approved for asset ${res.assetId}`);
    }
    const io = getIO();
    if (io) emitGlobal(io, SocketEvent.ASSET_UPDATED, { assetId: res.assetId, status: AssetStatus.ALLOCATED });
    return res;
  });
}

export async function returnAsset(id: string, actorId: string, input: any) {
  return await prisma.$transaction(async (tx) => {
    const alloc = await tx.assetAllocation.findUnique({ where: { id } });
    if (!alloc || alloc.status !== AllocationStatus.ALLOCATED) {
      throw new AppError(400, "INVALID_STATE", "Allocation is not active");
    }

    const updated = await tx.assetAllocation.update({
      where: { id },
      data: { 
        status: AllocationStatus.RETURNED, 
        actualReturnDate: input.actualReturnDate || new Date(),
        returnConditionNotes: input.returnConditionNotes
      }
    });

    await tx.asset.update({
      where: { id: alloc.assetId },
      data: { status: AssetStatus.AVAILABLE }
    });

    await logActivity(actorId, "ASSET_RETURNED", "ASSET", alloc.assetId, { allocationId: id });
    return updated;
  }).then(async (res) => {
    const io = getIO();
    if (io) emitGlobal(io, SocketEvent.ASSET_UPDATED, { assetId: res.assetId, status: AssetStatus.AVAILABLE });
    return res;
  });
}

export async function listAllocations(filters: any) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.allocatedToEmployeeId) where.allocatedToEmployeeId = filters.allocatedToEmployeeId;

  const [total, items] = await Promise.all([
    prisma.assetAllocation.count({ where }),
    prisma.assetAllocation.findMany({ where, skip, take: limit, include: { asset: true, allocatedToEmployee: { select: { name: true, email: true } } } })
  ]);

  return { total, page, limit, items };
}

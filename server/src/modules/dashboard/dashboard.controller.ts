import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/prisma";
import { AssetStatus, MaintenanceStatus, BookingStatus, AllocationStatus } from "@prisma/client";

export const getMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalAssets,
    availableAssets,
    allocatedAssets,
    maintenanceAssets,
    activeAllocations,
    activeMaintenance,
    activeBookings
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
    prisma.asset.count({ where: { status: AssetStatus.ALLOCATED } }),
    prisma.asset.count({ where: { status: AssetStatus.UNDER_MAINTENANCE } }),
    prisma.assetAllocation.count({ where: { status: AllocationStatus.ALLOCATED } }),
    prisma.maintenanceRequest.count({ where: { status: { in: [MaintenanceStatus.PENDING, MaintenanceStatus.IN_PROGRESS] } } }),
    prisma.resourceBooking.count({ where: { status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] }, endTime: { gte: new Date() } } })
  ]);

  sendSuccess(res, {
    assets: {
      total: totalAssets,
      available: availableAssets,
      allocated: allocatedAssets,
      maintenance: maintenanceAssets,
    },
    activities: {
      activeAllocations,
      activeMaintenance,
      activeBookings,
    }
  });
});

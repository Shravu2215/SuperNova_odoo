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
    prisma.resourceBooking.count({ where: { status: { in: [BookingStatus.PENDING_APPROVAL, BookingStatus.UPCOMING, BookingStatus.ONGOING] } } })
  ]);

  // Hoarding Alerts: active allocations per employee where count > 1
  const activeAllocationsByEmployee = await prisma.employee.findMany({
    where: {
      status: "ACTIVE",
      allocations: {
        some: { status: AllocationStatus.ALLOCATED }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      dept: { select: { name: true } },
      _count: {
        select: {
          allocations: {
            where: { status: AllocationStatus.ALLOCATED }
          }
        }
      }
    }
  });

  const hoardingAlerts = activeAllocationsByEmployee
    .filter(e => e._count.allocations > 1)
    .map(e => ({
      employeeId: e.id,
      name: e.name,
      email: e.email,
      department: e.dept.name,
      allocatedCount: e._count.allocations
    }));

  // Inventory Level by Category
  const categorySummary = await prisma.assetCategory.findMany({
    include: {
      _count: {
        select: { assets: true }
      },
      assets: {
        select: { status: true }
      }
    }
  });

  const inventoryByCategory = categorySummary.map(c => {
    const total = c._count.assets;
    const available = c.assets.filter(a => a.status === AssetStatus.AVAILABLE).length;
    const allocated = c.assets.filter(a => a.status === AssetStatus.ALLOCATED).length;
    const maintenance = c.assets.filter(a => a.status === AssetStatus.UNDER_MAINTENANCE).length;
    const reserved = c.assets.filter(a => a.status === AssetStatus.RESERVED).length;
    return {
      categoryId: c.id,
      categoryName: c.name,
      total,
      available,
      allocated,
      maintenance,
      reserved
    };
  });

  // Pending approval queues (future needs planning)
  const pendingAllocations = await prisma.assetAllocation.findMany({
    where: { status: AllocationStatus.PENDING_APPROVAL },
    include: {
      asset: { include: { category: true } },
      allocatedToEmployee: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const pendingBookings = await prisma.resourceBooking.findMany({
    where: { status: BookingStatus.PENDING_APPROVAL },
    include: {
      resource: true,
      bookedByEmployee: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

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
    },
    hoardingAlerts,
    inventoryByCategory,
    pendingAllocations,
    pendingBookings
  });
});

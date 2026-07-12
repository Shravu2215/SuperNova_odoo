import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/prisma";

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, entityId, employeeId, page = "1", limit = "20" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (entityType) where.entityType = String(entityType);
  if (entityId) where.entityId = String(entityId);
  if (employeeId) where.employeeId = String(employeeId);

  const [total, items] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      skip,
      take: Number(limit),
      include: { employee: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  sendSuccess(res, { total, page: Number(page), limit: Number(limit), items });
});

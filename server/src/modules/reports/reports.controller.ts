import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/prisma";
import { parse } from "json2csv";

export const getAssetReport = asyncHandler(async (req: Request, res: Response) => {
  const { format = "json", status, categoryId } = req.query;
  const where: any = {};
  if (status) where.status = String(status);
  if (categoryId) where.categoryId = String(categoryId);

  const assets = await prisma.asset.findMany({
    where,
    include: { category: true }
  });

  if (format === "csv") {
    const csvData = assets.map(a => ({
      AssetTag: a.assetTag,
      SerialNumber: a.serialNumber,
      Category: a.category.name,
      Status: a.status,
      Location: a.location,
      AcquiredDate: a.acquiredDate,
      AcquiredCost: a.acquiredCost,
    }));
    const csv = parse(csvData);
    res.header("Content-Type", "text/csv");
    res.attachment("asset_report.csv");
    return res.send(csv);
  }

  sendSuccess(res, { items: assets });
});

export const getAuditReport = asyncHandler(async (req: Request, res: Response) => {
  const { format = "json", cycleId } = req.query;
  const where: any = {};
  if (cycleId) where.cycleId = String(cycleId);

  const audits = await prisma.auditAssignment.findMany({
    where,
    include: { asset: true, assignedTo: { select: { name: true, email: true } }, cycle: true }
  });

  if (format === "csv") {
    const csvData = audits.map(a => ({
      Cycle: a.cycle.id,
      AssetTag: a.asset.assetTag,
      AssignedTo: a.assignedTo.name,
      Status: a.status,
      Notes: a.notes,
      CompletedAt: a.completedAt,
    }));
    const csv = parse(csvData);
    res.header("Content-Type", "text/csv");
    res.attachment("audit_report.csv");
    return res.send(csv);
  }

  sendSuccess(res, { items: audits });
});

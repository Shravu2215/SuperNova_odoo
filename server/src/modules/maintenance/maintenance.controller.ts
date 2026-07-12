import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as maintService from "./maintenance.service";

export const reportMaintenance = asyncHandler(async (req: Request, res: Response) => {
  const record = await maintService.reportMaintenance(req.user!.userId, req.body);
  sendSuccess(res, record, "Maintenance reported", 201);
});

export const updateMaintenanceStatus = asyncHandler(async (req: Request, res: Response) => {
  const record = await maintService.updateMaintenanceStatus(req.params.id, req.user!.userId, req.body);
  sendSuccess(res, record, "Maintenance status updated");
});

export const getMaintenanceRecords = asyncHandler(async (req: Request, res: Response) => {
  const result = await maintService.listMaintenance(req.query);
  sendSuccess(res, { items: result });
});

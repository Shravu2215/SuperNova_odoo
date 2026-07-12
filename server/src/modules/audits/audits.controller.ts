import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as auditService from "./audits.service";

export const createAuditCycle = asyncHandler(async (req: Request, res: Response) => {
  const cycle = await auditService.createAuditCycle(req.body);
  sendSuccess(res, cycle, "Audit cycle created", 201);
});

export const assignAudits = asyncHandler(async (req: Request, res: Response) => {
  const assignments = await auditService.assignAudits(req.params.id, req.body.assignments);
  sendSuccess(res, assignments, "Audits assigned", 201);
});

export const submitAuditResult = asyncHandler(async (req: Request, res: Response) => {
  const result = await auditService.submitAuditResult(req.params.id, req.user!.userId, req.body.status, req.body.notes);
  sendSuccess(res, result, "Audit result submitted");
});

export const getAuditCycles = asyncHandler(async (_req: Request, res: Response) => {
  const cycles = await auditService.listAuditCycles();
  sendSuccess(res, { items: cycles });
});

export const getMyAudits = asyncHandler(async (req: Request, res: Response) => {
  const audits = await auditService.getMyAudits(req.user!.userId);
  sendSuccess(res, { items: audits });
});

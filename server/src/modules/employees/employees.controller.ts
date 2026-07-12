import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as empService from "./employees.service";

export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const result = await empService.listEmployees(req.query as any);
  sendSuccess(res, result);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const employee = await empService.updateEmployeeRole(req.params.id, req.body.role, req.user!.userId);
  sendSuccess(res, employee, "Employee role updated");
});

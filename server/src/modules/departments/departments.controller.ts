import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as deptService from "./departments.service";

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const dept = await deptService.createDepartment(req.body);
  sendSuccess(res, dept, "Department created", 201);
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const dept = await deptService.updateDepartment(req.params.id, req.body);
  sendSuccess(res, dept, "Department updated");
});

export const getDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const depts = await deptService.listDepartments();
  sendSuccess(res, { items: depts });
});

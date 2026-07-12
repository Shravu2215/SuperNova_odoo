import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as allocService from "./allocations.service";
import { prisma } from "../../config/prisma";

export const allocateAsset = asyncHandler(async (req: Request, res: Response) => {
  const alloc = await allocService.allocateAsset(req.user!.userId, req.user!.role as any, req.body);
  sendSuccess(res, alloc, "Asset allocation processed", 201);
});

export const requestTransfer = asyncHandler(async (req: Request, res: Response) => {
  const alloc = await allocService.requestTransfer(req.params.id, req.user!.userId, req.body.newEmployeeId);
  sendSuccess(res, alloc, "Transfer requested", 201);
});

export const approveAllocation = asyncHandler(async (req: Request, res: Response) => {
  const alloc = await allocService.approveAllocation(req.params.id, req.user!.userId, req.user!.role as any);
  sendSuccess(res, alloc, "Allocation approved");
});

export const returnAsset = asyncHandler(async (req: Request, res: Response) => {
  const alloc = await allocService.returnAsset(req.params.id, req.user!.userId, req.body);
  sendSuccess(res, alloc, "Asset returned");
});

export const getAllocations = asyncHandler(async (req: Request, res: Response) => {
  const query: any = { ...req.query };
  if (req.user!.role === "DEPARTMENT_HEAD") {
    const head = await prisma.employee.findUnique({ where: { id: req.user!.userId } });
    if (head) {
      query.deptId = head.deptId;
    }
  }
  const result = await allocService.listAllocations(query);
  sendSuccess(res, result);
});

export const getMyAllocations = asyncHandler(async (req: Request, res: Response) => {
  const result = await allocService.listAllocations({ ...req.query, allocatedToEmployeeId: req.user!.userId });
  sendSuccess(res, result);
});

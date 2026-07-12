import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as catService from "./categories.service";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await catService.createCategory(req.body);
  sendSuccess(res, cat, "Category created", 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await catService.updateCategory(req.params.id, req.body);
  sendSuccess(res, cat, "Category updated");
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const cats = await catService.listCategories();
  sendSuccess(res, { items: cats });
});

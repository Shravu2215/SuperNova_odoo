import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as assetsService from "./assets.service";

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetsService.createAsset(req.user!.userId, req.body);
  sendSuccess(res, asset, "Asset registered successfully", 201);
});

export const getAssets = asyncHandler(async (req: Request, res: Response) => {
  const result = await assetsService.listAssets(req.query);
  sendSuccess(res, result);
});

export const getAssetDetail = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetsService.getAsset(req.params.id);
  const history = await assetsService.getAssetHistory(req.params.id);
  sendSuccess(res, { asset, history });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetsService.updateAsset(req.params.id, req.user!.userId, req.body);
  sendSuccess(res, asset, "Asset updated successfully");
});

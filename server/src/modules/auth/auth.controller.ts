import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as authService from "./auth.service";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { accessToken, user }, "Account created", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { accessToken, user }, "Logged in");
});

export const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { accessToken });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE);
  sendSuccess(res, null, "Logged out");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!.userId);
  sendSuccess(res, profile);
});

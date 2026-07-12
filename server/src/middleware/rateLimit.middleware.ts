import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse";

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, 429, "RATE_LIMITED", "Too many requests, please slow down."),
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 429, "RATE_LIMITED", "Too many auth requests, please try again shortly."),
});

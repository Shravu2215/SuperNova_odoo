import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { globalRateLimiter, authRateLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { sendSuccess, sendError } from "./utils/apiResponse";
import { logger } from "./utils/logger";
import authRoutes from "./modules/auth/auth.routes";
import deptRoutes from "./modules/departments/departments.routes";
import catRoutes from "./modules/categories/categories.routes";
import empRoutes from "./modules/employees/employees.routes";
import assetRoutes from "./modules/assets/assets.routes";
import allocRoutes from "./modules/allocation/allocations.routes";
import bookingRoutes from "./modules/bookings/bookings.routes";
import maintRoutes from "./modules/maintenance/maintenance.routes";
import auditRoutes from "./modules/audits/audits.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import activityLogRoutes from "./modules/activityLogs/activityLogs.routes";
import reportRoutes from "./modules/reports/reports.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.request(req.method, req.path, res.statusCode, Date.now() - start);
  });
  next();
});

app.get("/", (_req, res) => {
  res.redirect("/api/health");
});

app.get("/api/health", (_req, res) => {
  sendSuccess(res, { uptime: process.uptime() }, "Server is running");
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/departments", deptRoutes);
app.use("/api/categories", catRoutes);
app.use("/api/employees", empRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/allocations", allocRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_req, res) => {
  sendError(res, 404, "NOT_FOUND", "Route not found");
});

app.use(errorHandler);

// ===== MAIN SERVER FILE =====
// Run with:  npm run dev   (starts on http://localhost:5000)

import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";

// Our utilities
import { validateEnv } from "./lib/env";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";

// Validate environment first
validateEnv();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

logger.info("🚀 Server starting up...");

// ---------- SECURITY MIDDLEWARE ----------
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // max 300 requests per IP
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  })
);

app.use(express.json());

// ---------- LOGGING MIDDLEWARE ----------
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.request(req.method, req.path, res.statusCode, duration);
  });
  next();
});

// ---------- HEALTH CHECK ----------
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "Server is running 🚀",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);

// TOMORROW: Add your problem-specific routes here
// import taskRoutes from "./routes/task.routes";
// app.use("/api/tasks", taskRoutes);

// ---------- 404 HANDLER ----------
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ---------- SOCKET.IO ----------
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("🔌 Client connected", { socketId: socket.id });

  // Example event
  socket.on("ping", () => {
    socket.emit("pong", { time: new Date().toISOString() });
  });

  socket.on("disconnect", () => {
    logger.info("❌ Client disconnected", { socketId: socket.id });
  });
});

// ---------- ERROR HANDLER - MUST BE LAST ----------
app.use(errorHandler);

// ---------- START SERVER ----------
server.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
  logger.info(`✅ Allowing frontend from ${CLIENT_URL}`);
  logger.info(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

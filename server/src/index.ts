// ===== MAIN SERVER FILE =====
// Run with:  npm run dev   (starts on http://localhost:5000)
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ---------- SECURITY MIDDLEWARE (your stack: helmet, cors, rate-limit) ----------
app.use(helmet()); // sets secure HTTP headers
app.use(
  cors({
    origin: CLIENT_URL, // only allow our frontend to call this API
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // max 300 requests per IP per window
    message: { message: "Too many requests, slow down." },
  })
);
app.use(express.json()); // lets us read JSON request bodies

// ---------- ROUTES ----------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running 🚀" });
});

app.use("/api/auth", authRoutes);

// TOMORROW: add your problem-specific routes here, e.g.
// import taskRoutes from "./routes/task.routes";
// app.use("/api/tasks", taskRoutes);

// ---------- SOCKET.IO (realtime) ----------
// NOTE: Socket.io needs its OWN cors config - this is the classic gotcha!
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Example event - frontend can emit "ping" and gets "pong" back
  socket.on("ping", () => {
    socket.emit("pong", { time: new Date().toISOString() });
  });

  // TOMORROW: add your realtime events here, e.g.
  // socket.on("send-message", (data) => {
  //   io.emit("new-message", data); // broadcast to everyone
  // });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ---------- START ----------
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Allowing frontend from ${CLIENT_URL}`);
});

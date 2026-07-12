// Realtime connection to the backend.
// Import anywhere:  import { socket } from "@/lib/socket";
// Then:  socket.emit("ping")   and   socket.on("pong", cb)
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});

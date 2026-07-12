import { Server } from "socket.io";

export const SocketEvent = {
  NOTIFICATION_NEW: "notification:new",
  ASSET_UPDATED: "asset:updated",
  BOOKING_CREATED: "booking:created",
  BOOKING_CANCELLED: "booking:cancelled",
  DASHBOARD_REFRESH: "dashboard:refresh",
} as const;

export function emitToUser(io: Server, userId: string, event: string, payload: unknown) {
  io.to(userId).emit(event, payload);
}

export function emitGlobal(io: Server, event: string, payload: unknown) {
  io.emit(event, payload);
}

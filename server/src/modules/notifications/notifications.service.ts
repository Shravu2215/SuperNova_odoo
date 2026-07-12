import { prisma } from "../../config/prisma";
import { NotificationType } from "@prisma/client";
import { getIO } from "../../config/socket";
import { emitToUser, SocketEvent } from "../../sockets/events";

export async function notify(recipientId: string, type: NotificationType, message: string, metadata?: any) {
  const notification = await prisma.notification.create({
    data: { recipientId, type, message, metadata: metadata || {} },
  });
  
  try {
    const io = getIO();
    emitToUser(io, recipientId, SocketEvent.NOTIFICATION_NEW, notification);
  } catch (err) {
    // ignore if socket not initialized yet in some test contexts
  }
  
  return notification;
}

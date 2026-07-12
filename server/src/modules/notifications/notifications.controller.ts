import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { prisma } from "../../config/prisma";

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  sendSuccess(res, { items: notifications });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.updateMany({
    where: { id: req.params.id, recipientId: req.user!.userId },
    data: { isRead: true }
  });
  sendSuccess(res, notification, "Notification marked as read");
});

import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { logActivity } from "../../utils/activityLogger";
import { BookingStatus, NotificationType, UserRole } from "@prisma/client";
import { emitGlobal, SocketEvent } from "../../sockets/events";
import { getIO } from "../../config/socket";
import { notify } from "../notifications/notifications.service";

export async function createBooking(employeeId: string, input: any) {
  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({ where: { id: input.assetId } });
    if (!asset || !asset.isShareable) {
      throw new AppError(400, "BAD_REQUEST", "Asset is not shareable or not found");
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    
    const overlap = await tx.assetBooking.findFirst({
      where: {
        assetId: input.assetId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } }
        ]
      }
    });

    if (overlap) {
      throw new AppError(409, "CONFLICT", "Asset is already booked for this time period");
    }

    const booking = await tx.assetBooking.create({
      data: {
        assetId: input.assetId,
        employeeId,
        startTime: start,
        endTime: end,
        purpose: input.purpose,
        status: BookingStatus.CONFIRMED,
      }
    });

    await logActivity(employeeId, "BOOKING_CREATED", "ASSET", input.assetId, { bookingId: booking.id });
    return booking;
  }).then(async (res) => {
    await notify(employeeId, NotificationType.BOOKING_CONFIRMED, `Booking confirmed for asset ${input.assetId}`);
    try {
      const io = getIO();
      emitGlobal(io, SocketEvent.BOOKING_CREATED, res);
    } catch {}
    return res;
  });
}

export async function listBookings(filters: any) {
  const where: any = {};
  if (filters.employeeId) where.employeeId = filters.employeeId;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.status) where.status = filters.status;

  return prisma.assetBooking.findMany({ 
    where,
    include: { asset: true, employee: { select: { name: true, email: true } } },
    orderBy: { startTime: "asc" }
  });
}

export async function updateBookingStatus(id: string, actorId: string, actorRole: UserRole, status: BookingStatus) {
  const booking = await prisma.assetBooking.findUnique({ where: { id } });
  if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");

  if (booking.employeeId !== actorId && actorRole !== UserRole.ADMIN && actorRole !== UserRole.ASSET_MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Not authorized to modify this booking");
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.assetBooking.update({
      where: { id },
      data: { status }
    });

    await logActivity(actorId, `BOOKING_${status}`, "ASSET", booking.assetId, { bookingId: id });
    return updated;
  }).then(async (res) => {
    if (status === BookingStatus.CANCELLED) {
      await notify(res.employeeId, NotificationType.BOOKING_CANCELLED, `Booking cancelled for asset ${res.assetId}`);
      try {
        const io = getIO();
        emitGlobal(io, SocketEvent.BOOKING_CANCELLED, res);
      } catch {}
    }
    return res;
  });
}

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
    
    const overlap = await tx.resourceBooking.findFirst({
      where: {
        resourceId: input.assetId,
        status: { in: [BookingStatus.PENDING_APPROVAL, BookingStatus.UPCOMING, BookingStatus.ONGOING] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } }
        ]
      }
    });

    if (overlap) {
      throw new AppError(409, "CONFLICT", "Asset is already booked or pending approval for this time period");
    }

    const booking = await tx.resourceBooking.create({
      data: {
        resourceId: input.assetId,
        bookedByEmployeeId: employeeId,
        startTime: start,
        endTime: end,
        notes: input.purpose,
        status: BookingStatus.PENDING_APPROVAL,
      }
    });

    await logActivity(employeeId, "BOOKING_CREATED", "ASSET", input.assetId, { bookingId: booking.id });
    return booking;
  }).then(async (res) => {
    await notify(employeeId, NotificationType.BOOKING_REMINDER, `Booking request submitted for asset ${input.assetId}`);
    try {
      const io = getIO();
      emitGlobal(io, SocketEvent.BOOKING_CREATED, res);
    } catch {}
    return res;
  });
}

export async function listBookings(filters: any) {
  const where: any = {};
  if (filters.employeeId) where.bookedByEmployeeId = filters.employeeId;
  if (filters.assetId) where.resourceId = filters.assetId;
  if (filters.status) where.status = filters.status;
  if (filters.deptId) {
    where.bookedByEmployee = {
      deptId: filters.deptId
    };
  }

  return prisma.resourceBooking.findMany({ 
    where,
    include: { resource: true, bookedByEmployee: { select: { name: true, email: true } } },
    orderBy: { startTime: "asc" }
  });
}

export async function updateBookingStatus(id: string, actorId: string, actorRole: UserRole, status: BookingStatus) {
  const booking = await prisma.resourceBooking.findUnique({ where: { id } });
  if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");

  if (actorRole === UserRole.DEPARTMENT_HEAD) {
    const head = await prisma.employee.findUnique({ where: { id: actorId } });
    const bookedBy = await prisma.employee.findUnique({ where: { id: booking.bookedByEmployeeId } });
    if (!head || !bookedBy || bookedBy.deptId !== head.deptId) {
      throw new AppError(403, "FORBIDDEN", "Not authorized to modify this booking (must be in your department)");
    }
  } else if (booking.bookedByEmployeeId !== actorId && actorRole !== UserRole.ADMIN && actorRole !== UserRole.ASSET_MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Not authorized to modify this booking");
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.resourceBooking.update({
      where: { id },
      data: { status }
    });

    await logActivity(actorId, `BOOKING_${status}`, "ASSET", booking.resourceId, { bookingId: id });
    return updated;
  }).then(async (res) => {
    const io = getIO();
    if (status === BookingStatus.CANCELLED || status === BookingStatus.REJECTED) {
      await notify(res.bookedByEmployeeId, NotificationType.BOOKING_CANCELLED, `Booking ${status.toLowerCase()} for asset ${res.resourceId}`);
      try {
        if (io) emitGlobal(io, SocketEvent.BOOKING_CANCELLED, res);
      } catch {}
    } else if (status === BookingStatus.UPCOMING) {
      await notify(res.bookedByEmployeeId, NotificationType.BOOKING_CONFIRMED, `Booking approved for asset ${res.resourceId}`);
      try {
        if (io) emitGlobal(io, SocketEvent.BOOKING_CREATED, res);
      } catch {}
    }
    return res;
  });
}

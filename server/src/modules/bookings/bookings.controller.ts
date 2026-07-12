import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as bookingsService from "./bookings.service";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.createBooking(req.user!.userId, req.body);
  sendSuccess(res, booking, "Booking created", 201);
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.updateBookingStatus(req.params.id, req.user!.userId, req.user!.role as UserRole, req.body.status);
  sendSuccess(res, booking, `Booking status updated to ${req.body.status}`);
});

export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const query: any = { ...req.query };
  if (req.user!.role === "DEPARTMENT_HEAD") {
    const head = await prisma.employee.findUnique({ where: { id: req.user!.userId } });
    if (head) {
      query.deptId = head.deptId;
    }
  }
  const result = await bookingsService.listBookings(query);
  sendSuccess(res, { items: result });
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingsService.listBookings({ ...req.query, employeeId: req.user!.userId });
  sendSuccess(res, { items: result });
});

import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import { UserRole } from "@prisma/client";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role as UserRole | undefined;
    if (!role || !roles.includes(role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"));
    }
    next();
  };
}

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";
import { SignupInput, LoginInput } from "./auth.schema";
import { SafeEmployee } from "./auth.types";
import { UserRole } from "@prisma/client";

const BCRYPT_ROUNDS = 10;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function toSafeEmployee(employee: { id: string; name: string; email: string; role: UserRole; deptId: string; createdAt: Date }): SafeEmployee {
  return { id: employee.id, name: employee.name, email: employee.email, role: employee.role, deptId: employee.deptId, createdAt: employee.createdAt };
}

function signAccessToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

export async function signup(input: SignupInput) {
  const existing = await prisma.employee.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
  }

  // Validate deptId exists
  const dept = await prisma.department.findUnique({ where: { id: input.deptId } });
  if (!dept) {
    throw new AppError(400, "INVALID_DEPARTMENT", "Invalid department ID");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const employee = await prisma.employee.create({
    data: { 
      name: input.name, 
      email: input.email, 
      password: passwordHash, 
      deptId: input.deptId, 
      role: input.role || UserRole.EMPLOYEE 
    },
  });

  return {
    user: toSafeEmployee(employee),
    accessToken: signAccessToken(employee.id, employee.email, employee.role),
    refreshToken: signRefreshToken(employee.id),
  };
}

export async function login(input: LoginInput) {
  const employee = await prisma.employee.findUnique({ where: { email: input.email } });
  if (!employee) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  
  if (employee.status !== "ACTIVE") {
    throw new AppError(401, "ACCOUNT_INACTIVE", "Your account is not active");
  }

  const valid = await bcrypt.compare(input.password, employee.password);
  if (!valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return {
    user: toSafeEmployee(employee),
    accessToken: signAccessToken(employee.id, employee.email, employee.role),
    refreshToken: signRefreshToken(employee.id),
  };
}

export async function refresh(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw new AppError(401, "UNAUTHENTICATED", "No refresh token provided");
  }

  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw new AppError(401, "UNAUTHENTICATED", "Invalid or expired refresh token");
  }

  const employee = await prisma.employee.findUnique({ where: { id: payload.userId } });
  if (!employee) {
    throw new AppError(401, "UNAUTHENTICATED", "User no longer exists");
  }
  if (employee.status !== "ACTIVE") {
    throw new AppError(401, "ACCOUNT_INACTIVE", "Your account is not active");
  }

  return {
    accessToken: signAccessToken(employee.id, employee.email, employee.role),
    refreshToken: signRefreshToken(employee.id),
  };
}

export async function getProfile(userId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: userId } });
  if (!employee) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }
  return toSafeEmployee(employee);
}

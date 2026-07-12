// Handles signup, login, and "who am I" requests.
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

function signToken(userId: string) {
  // Creates the login token the frontend will store and send back on every request
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  // 1. Check validation rules (defined in auth.routes.ts)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, deptId } = req.body;

  // 2. Reject if email already used
  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  // 3. Hash the password (never store plain text!)
  const hashed = await bcrypt.hash(password, 10);

  // 4. Save user
  const user = await prisma.employee.create({
  data: {
    name,
    email,
    password: hashed,
    deptId,
  },
});

  // 5. Send back a token so they're logged in immediately
  const token = signToken(user.id);
  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await prisma.employee.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Compare typed password with the stored hash
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user.id);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

// GET /api/auth/me  (protected - needs a valid token)
export async function me(req: Request, res: Response) {
  // req.userId is set by the auth middleware
  const userId = (req as any).userId as string;

  const user = await prisma.employee.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
}

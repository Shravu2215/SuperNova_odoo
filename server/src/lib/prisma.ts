// One shared Prisma client for the whole app.
// Import this anywhere you need the database:  import { prisma } from "../lib/prisma";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

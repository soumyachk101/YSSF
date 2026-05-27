import type { Request } from "express";
import { jwtVerify } from "jose";
import { prisma } from "./prisma.js";

if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is required.");
}

export const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;
    if (!userId) return null;
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

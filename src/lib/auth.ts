import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "cruseqr_fallback_jwt_secret_99482";
export const AUTH_COOKIE_NAME = "cruseqr_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  avatar?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      avatar: user.avatar,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Universal Session/Auth Resolver
 * Supports:
 * 1. HTTP-Only Cookie session
 * 2. Header `Authorization: Bearer <jwt_or_api_key>`
 * 3. Header `x-api-key: cqr_live_<userId>`
 */
export async function getSession(request?: Request): Promise<SessionUser | null> {
  try {
    // 1. Check API Key or Bearer Token from headers
    let authHeader: string | null = null;
    let apiKeyHeader: string | null = null;

    if (request) {
      authHeader = request.headers.get("authorization");
      apiKeyHeader = request.headers.get("x-api-key");
    } else {
      const h = headers();
      authHeader = h.get("authorization");
      apiKeyHeader = h.get("x-api-key");
    }

    const tokenOrKey = apiKeyHeader || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (tokenOrKey) {
      // Direct API Key pattern: cqr_live_<userId>
      if (tokenOrKey.startsWith("cqr_live_")) {
        const userId = tokenOrKey.replace("cqr_live_", "");
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, role: true, plan: true, avatar: true },
        });
        if (user) return user;
      }

      // Check if it's a JWT token
      const jwtUser = verifyToken(tokenOrKey);
      if (jwtUser) return jwtUser;
    }

    // 2. Fall back to Cookie Session
    const cookieStore = cookies();
    const cookieToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (cookieToken) {
      return verifyToken(cookieToken);
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}


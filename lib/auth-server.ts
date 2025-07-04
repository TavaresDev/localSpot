import { auth } from "@/lib/auth";
import { APIException } from "@/lib/api-error";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export async function validateSession(): Promise<AuthenticatedUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw APIException.unauthorized("Authentication required");
  }

  // Get full user data including role
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!userData.length) {
    throw APIException.unauthorized("User not found");
  }

  return {
    id: userData[0].id,
    name: userData[0].name,
    email: userData[0].email,
    role: userData[0].role,
    image: userData[0].image || undefined,
  };
}

export async function requireRole(allowedRoles: string[]): Promise<AuthenticatedUser> {
  const user = await validateSession();
  
  if (!allowedRoles.includes(user.role)) {
    throw APIException.forbidden(`Requires one of: ${allowedRoles.join(", ")}`);
  }

  return user;
}

export async function requireModerator(): Promise<AuthenticatedUser> {
  return await requireRole(["moderator", "admin"]);
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  return await requireRole(["admin"]);
}
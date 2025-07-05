import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { collections, user } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { eq } from "drizzle-orm";

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  spotIds: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});


interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();

  const collectionWithUser = await db
    .select({
      id: collections.id,
      name: collections.name,
      spotIds: collections.spotIds,
      isPublic: collections.isPublic,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      userId: collections.userId,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(collections)
    .leftJoin(user, eq(collections.userId, user.id))
    .where(eq(collections.id, id))
    .limit(1);

  if (!collectionWithUser.length) {
    throw APIException.notFound("Collection not found");
  }

  const collection = collectionWithUser[0];

  // Check access permissions
  const canAccess = 
    collection.isPublic ||
    collection.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canAccess) {
    throw APIException.forbidden("Access denied to this collection");
  }

  return NextResponse.json(collection);
});

export const PUT = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();
  
  const body = await request.json();
  const validatedData = updateCollectionSchema.parse(body);

  // Check if collection exists
  const existingCollection = await db
    .select({ userId: collections.userId })
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  if (!existingCollection.length) {
    throw APIException.notFound("Collection not found");
  }

  const collection = existingCollection[0];

  // Check permissions (only owner or admin/moderator can edit)
  const canEdit = 
    collection.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canEdit) {
    throw APIException.forbidden("Access denied");
  }

  await db
    .update(collections)
    .set({ ...validatedData, updatedAt: new Date() })
    .where(eq(collections.id, id))
    .returning();

  // Get the updated collection with user data
  const collectionWithUser = await db
    .select({
      id: collections.id,
      name: collections.name,
      spotIds: collections.spotIds,
      isPublic: collections.isPublic,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(collections)
    .leftJoin(user, eq(collections.userId, user.id))
    .where(eq(collections.id, id))
    .limit(1);

  return NextResponse.json(collectionWithUser[0]);
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();

  // Check if collection exists
  const existingCollection = await db
    .select({ userId: collections.userId })
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  if (!existingCollection.length) {
    throw APIException.notFound("Collection not found");
  }

  const collection = existingCollection[0];

  // Check permissions (only owner or admin/moderator can delete)
  const canDelete = 
    collection.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canDelete) {
    throw APIException.forbidden("Access denied");
  }

  await db.delete(collections).where(eq(collections.id, id));

  return NextResponse.json({ message: "Collection deleted successfully" });
});
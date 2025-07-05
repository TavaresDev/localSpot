import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { collections, user } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling } from "@/lib/api-error";
import { eq, and, or, desc, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  spotIds: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

const collectionQuerySchema = z.object({
  userId: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(["newest", "oldest", "name"]).default("newest"),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const params = collectionQuerySchema.parse(Object.fromEntries(searchParams));
  
  const currentUser = await validateSession();

  // Build the where condition
  let whereCondition;

  if (params.isPublic !== undefined) {
    if (params.isPublic) {
      whereCondition = eq(collections.isPublic, true);
    } else {
      whereCondition = and(
        eq(collections.isPublic, false),
        eq(collections.userId, currentUser.id)
      );
    }
  } else {
    // Apply visibility filter - show public collections and user's own collections
    whereCondition = or(
      eq(collections.isPublic, true),
      eq(collections.userId, currentUser.id)
    );
  }

  // Apply user filter
  if (params.userId) {
    const userCondition = params.userId === currentUser.id
      ? eq(collections.userId, params.userId)
      : and(
          eq(collections.userId, params.userId),
          eq(collections.isPublic, true)
        );
    
    whereCondition = whereCondition ? and(whereCondition, userCondition) : userCondition;
  }

  // Build sorting
  let orderByClause;
  switch (params.sort) {
    case "newest":
      orderByClause = desc(collections.createdAt);
      break;
    case "oldest":
      orderByClause = asc(collections.createdAt);
      break;
    case "name":
      orderByClause = asc(collections.name);
      break;
    default:
      orderByClause = desc(collections.createdAt);
  }

  const query = db
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
    .where(whereCondition)
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  const results = await query;

  return NextResponse.json({
    collections: results,
    pagination: {
      limit: params.limit,
      offset: params.offset,
      total: results.length,
    },
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const currentUser = await validateSession();
  
  const body = await request.json();
  const validatedData = createCollectionSchema.parse(body);

  const newCollection = {
    id: nanoid(),
    userId: currentUser.id,
    name: validatedData.name,
    spotIds: validatedData.spotIds,
    isPublic: validatedData.isPublic,
  };

  const [createdCollection] = await db
    .insert(collections)
    .values(newCollection)
    .returning();

  // Get the collection with user data
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
    .where(eq(collections.id, createdCollection.id))
    .limit(1);

  return NextResponse.json(collectionWithUser[0], { status: 201 });
});
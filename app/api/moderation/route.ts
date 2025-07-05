import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { moderationQueue, user } from "@/db/schema";
import { requireModerator } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";


const moderationQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  contentType: z.enum(["spot", "event", "collection"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const params = moderationQuerySchema.parse(Object.fromEntries(searchParams));
  
  await requireModerator();

  // Build conditions first
  const conditions: any[] = [];
  
  if (params.status) {
    conditions.push(eq(moderationQueue.status, params.status));
  }
  
  if (params.contentType) {
    conditions.push(eq(moderationQueue.contentType, params.contentType));
  }

  // Build complete query in one chain to avoid type issues
  const baseQuery = db
    .select({
      id: moderationQueue.id,
      contentType: moderationQueue.contentType,
      contentId: moderationQueue.contentId,
      status: moderationQueue.status,
      feedback: moderationQueue.feedback,
      reviewedAt: moderationQueue.reviewedAt,
      createdAt: moderationQueue.createdAt,
      updatedAt: moderationQueue.updatedAt,
      moderator: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(moderationQueue)
    .leftJoin(user, eq(moderationQueue.moderatorId, user.id));

  // Build where clause
  const queryWithWhere = conditions.length > 0 
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  // Add sorting
  const sortOrder = params.sort === "newest" 
    ? desc(moderationQueue.createdAt)
    : asc(moderationQueue.createdAt);

  // Complete query with all operations
  const results = await queryWithWhere
    .orderBy(sortOrder)
    .limit(params.limit)
    .offset(params.offset);

  // Get total count with same conditions
  const baseCountQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(moderationQueue);

  const countQuery = conditions.length > 0 
    ? baseCountQuery.where(and(...conditions))
    : baseCountQuery;

  const [{ count: total }] = await countQuery;

  return NextResponse.json({
    moderationQueue: results,
    pagination: {
      limit: params.limit,
      offset: params.offset,
      total,
    },
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireModerator();
  
  const body = await request.json();
  const { contentType, contentId } = z.object({
    contentType: z.enum(["spot", "event", "collection"]),
    contentId: z.string().min(1),
  }).parse(body);

  // Check if content already in moderation queue
  const existingEntry = await db
    .select({ id: moderationQueue.id })
    .from(moderationQueue)
    .where(eq(moderationQueue.contentId, contentId))
    .limit(1);

  if (existingEntry.length) {
    throw APIException.badRequest("Content is already in moderation queue");
  }

  const newModerationEntry = {
    id: nanoid(),
    contentType,
    contentId,
    status: "pending" as const,
    moderatorId: null,
    reviewedAt: null,
    feedback: null,
  };

  const [created] = await db
    .insert(moderationQueue)
    .values(newModerationEntry)
    .returning();

  return NextResponse.json(created, { status: 201 });
});
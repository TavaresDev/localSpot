import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { moderationQueue, spots } from "@/db/schema";
import { requireModerator } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { eq } from "drizzle-orm";

const moderationActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  feedback: z.string().max(1000).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PUT = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await requireModerator();
  
  const body = await request.json();
  const { action, feedback } = moderationActionSchema.parse(body);

  // Check if moderation entry exists and is pending
  const existingEntry = await db
    .select({
      id: moderationQueue.id,
      contentType: moderationQueue.contentType,
      contentId: moderationQueue.contentId,
      status: moderationQueue.status,
    })
    .from(moderationQueue)
    .where(eq(moderationQueue.id, id))
    .limit(1);

  if (!existingEntry.length) {
    throw APIException.notFound("Moderation entry not found");
  }

  const entry = existingEntry[0];

  if (entry.status !== "pending") {
    throw APIException.badRequest("Moderation entry has already been reviewed");
  }

  // Update moderation queue entry
  const newStatus = action === "approve" ? "approved" : "rejected";
  
  await db
    .update(moderationQueue)
    .set({
      status: newStatus,
      moderatorId: currentUser.id,
      reviewedAt: new Date(),
      feedback: feedback || null,
      updatedAt: new Date(),
    })
    .where(eq(moderationQueue.id, id));

  // Update the content based on the action
  if (entry.contentType === "spot") {
    const contentStatus = action === "approve" ? "approved" : "rejected";
    
    await db
      .update(spots)
      .set({
        status: contentStatus,
        updatedAt: new Date(),
      })
      .where(eq(spots.id, entry.contentId));
  }

  // Get updated moderation entry
  const updatedEntry = await db
    .select()
    .from(moderationQueue)
    .where(eq(moderationQueue.id, id))
    .limit(1);

  return NextResponse.json({
    ...updatedEntry[0],
    message: `Content ${action}d successfully`,
  });
});

export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  await requireModerator();

  const moderationEntry = await db
    .select()
    .from(moderationQueue)
    .where(eq(moderationQueue.id, id))
    .limit(1);

  if (!moderationEntry.length) {
    throw APIException.notFound("Moderation entry not found");
  }

  return NextResponse.json(moderationEntry[0]);
});
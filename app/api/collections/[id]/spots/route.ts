import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { collections, spots } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { eq } from "drizzle-orm";

const spotActionSchema = z.object({
  spotId: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const POST = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();
  
  const body = await request.json();
  const { spotId } = spotActionSchema.parse(body);

  // Check if collection exists and user has permission
  const existingCollection = await db
    .select({ 
      userId: collections.userId,
      spotIds: collections.spotIds 
    })
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  if (!existingCollection.length) {
    throw APIException.notFound("Collection not found");
  }

  const collection = existingCollection[0];

  // Check permissions
  const canEdit = 
    collection.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canEdit) {
    throw APIException.forbidden("Access denied");
  }

  // Verify spot exists
  const spot = await db
    .select({ id: spots.id })
    .from(spots)
    .where(eq(spots.id, spotId))
    .limit(1);

  if (!spot.length) {
    throw APIException.notFound("Spot not found");
  }

  // Get current spot IDs
  const currentSpotIds = (collection.spotIds as string[]) || [];
  
  // Check if spot is already in collection
  if (currentSpotIds.includes(spotId)) {
    throw APIException.badRequest("Spot is already in collection");
  }

  // Add spot to collection
  const updatedSpotIds = [...currentSpotIds, spotId];

  await db
    .update(collections)
    .set({ 
      spotIds: updatedSpotIds,
      updatedAt: new Date() 
    })
    .where(eq(collections.id, id));

  return NextResponse.json({ 
    message: "Spot added to collection successfully",
    spotIds: updatedSpotIds 
  });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();
  
  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get("spotId");
  
  if (!spotId) {
    throw APIException.badRequest("spotId query parameter is required");
  }

  // Check if collection exists and user has permission
  const existingCollection = await db
    .select({ 
      userId: collections.userId,
      spotIds: collections.spotIds 
    })
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  if (!existingCollection.length) {
    throw APIException.notFound("Collection not found");
  }

  const collection = existingCollection[0];

  // Check permissions
  const canEdit = 
    collection.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canEdit) {
    throw APIException.forbidden("Access denied");
  }

  // Get current spot IDs
  const currentSpotIds = (collection.spotIds as string[]) || [];
  
  // Check if spot is in collection
  if (!currentSpotIds.includes(spotId)) {
    throw APIException.badRequest("Spot is not in collection");
  }

  // Remove spot from collection
  const updatedSpotIds = currentSpotIds.filter(id => id !== spotId);

  await db
    .update(collections)
    .set({ 
      spotIds: updatedSpotIds,
      updatedAt: new Date() 
    })
    .where(eq(collections.id, id));

  return NextResponse.json({ 
    message: "Spot removed from collection successfully",
    spotIds: updatedSpotIds 
  });
});
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { spots, user, events } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { SPOT_TYPES, SPOT_DIFFICULTIES, SPOT_VISIBILITIES, SPOT_STATUSES } from "@/lib/types/spots";
import { eq, gte, desc, and } from "drizzle-orm";

const updateSpotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  spotType: z.enum(SPOT_TYPES).optional(),
  difficulty: z.enum(SPOT_DIFFICULTIES).optional(),
  visibility: z.enum(SPOT_VISIBILITIES).optional(),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  endLat: z.number().min(-90).max(90).optional(),
  endLng: z.number().min(-180).max(180).optional(),
  bestTimes: z.string().max(500).optional(),
  safetyNotes: z.string().max(1000).optional(),
  rules: z.string().max(1000).optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(SPOT_STATUSES).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();

  const spotWithUser = await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      locationLat: spots.locationLat,
      locationLng: spots.locationLng,
      visibility: spots.visibility,
      spotType: spots.spotType,
      difficulty: spots.difficulty,
      startLat: spots.startLat,
      startLng: spots.startLng,
      endLat: spots.endLat,
      endLng: spots.endLng,
      bestTimes: spots.bestTimes,
      safetyNotes: spots.safetyNotes,
      rules: spots.rules,
      photos: spots.photos,
      status: spots.status,
      createdAt: spots.createdAt,
      updatedAt: spots.updatedAt,
      userId: spots.userId,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(spots)
    .leftJoin(user, eq(spots.userId, user.id))
    .where(eq(spots.id, id))
    .limit(1);

  if (!spotWithUser.length) {
    throw APIException.notFound("Spot not found");
  }

  const spot = spotWithUser[0];

  // Check access permissions
  const canAccess = 
    spot.visibility === "public" ||
    spot.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canAccess) {
    throw APIException.forbidden("Access denied to this spot");
  }

  // Hide pending spots unless user is owner or moderator
  if (spot.status === "pending" && 
      spot.userId !== currentUser.id && 
      !["admin", "moderator"].includes(currentUser.role)) {
    throw APIException.notFound("Spot not found");
  }

  // Get upcoming events at this spot
  const upcomingEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startTime: events.startTime,
      endTime: events.endTime,
      isRecurring: events.isRecurring,
      recurrenceData: events.recurrenceData,
      photos: events.photos,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      userId: events.userId,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(events)
    .leftJoin(user, eq(events.userId, user.id))
    .where(
      and(
        eq(events.spotId, id),
        gte(events.startTime, new Date()) // Only upcoming events
      )
    )
    .orderBy(desc(events.startTime))
    .limit(10); // Limit to 10 upcoming events

  // Get total event count for stats (including past events)
  const totalEvents = await db
    .select()
    .from(events)
    .where(eq(events.spotId, id));

  // Construct response with events
  const response = {
    ...spot,
    events: upcomingEvents,
    _count: {
      events: totalEvents.length,
    },
  };

  return NextResponse.json(response);
});

export const PUT = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();
  
  const body = await request.json();
  const validatedData = updateSpotSchema.parse(body);

  // Check if spot exists
  const existingSpot = await db
    .select({ userId: spots.userId, status: spots.status })
    .from(spots)
    .where(eq(spots.id, id))
    .limit(1);

  if (!existingSpot.length) {
    throw APIException.notFound("Spot not found");
  }

  const spot = existingSpot[0];

  // Check permissions
  const canEdit = 
    spot.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canEdit) {
    throw APIException.forbidden("Access denied");
  }

  // Only moderators/admins can change status
  if (validatedData.status && !["admin", "moderator"].includes(currentUser.role)) {
    delete validatedData.status;
  }

  // Convert numbers to strings for coordinates
  const updateData: Record<string, unknown> = { ...validatedData };
  if (updateData.locationLat) updateData.locationLat = updateData.locationLat.toString();
  if (updateData.locationLng) updateData.locationLng = updateData.locationLng.toString();
  if (updateData.startLat) updateData.startLat = updateData.startLat.toString();
  if (updateData.startLng) updateData.startLng = updateData.startLng.toString();
  if (updateData.endLat) updateData.endLat = updateData.endLat.toString();
  if (updateData.endLng) updateData.endLng = updateData.endLng.toString();

  await db
    .update(spots)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(spots.id, id))
    .returning();

  // Get the updated spot with user data
  const spotWithUser = await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      locationLat: spots.locationLat,
      locationLng: spots.locationLng,
      visibility: spots.visibility,
      spotType: spots.spotType,
      difficulty: spots.difficulty,
      startLat: spots.startLat,
      startLng: spots.startLng,
      endLat: spots.endLat,
      endLng: spots.endLng,
      bestTimes: spots.bestTimes,
      safetyNotes: spots.safetyNotes,
      rules: spots.rules,
      photos: spots.photos,
      status: spots.status,
      createdAt: spots.createdAt,
      updatedAt: spots.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(spots)
    .leftJoin(user, eq(spots.userId, user.id))
    .where(eq(spots.id, id))
    .limit(1);

  return NextResponse.json(spotWithUser[0]);
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();

  // Check if spot exists
  const existingSpot = await db
    .select({ userId: spots.userId })
    .from(spots)
    .where(eq(spots.id, id))
    .limit(1);

  if (!existingSpot.length) {
    throw APIException.notFound("Spot not found");
  }

  const spot = existingSpot[0];

  // Check permissions
  const canDelete = 
    spot.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canDelete) {
    throw APIException.forbidden("Access denied");
  }

  await db.delete(spots).where(eq(spots.id, id));

  return NextResponse.json({ message: "Spot deleted successfully" });
});
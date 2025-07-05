import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { events, spots, user } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { eq } from "drizzle-orm";

const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceData: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    interval: z.number().min(1).max(12),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();

  const eventWithDetails = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startTime: events.startTime,
      endTime: events.endTime,
      isRecurring: events.isRecurring,
      recurrenceData: events.recurrenceData,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      userId: events.userId,
      spot: {
        id: spots.id,
        name: spots.name,
        description: spots.description,
        locationLat: spots.locationLat,
        locationLng: spots.locationLng,
        spotType: spots.spotType,
        difficulty: spots.difficulty,
        visibility: spots.visibility,
        status: spots.status,
        userId: spots.userId,
      },
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(events)
    .leftJoin(spots, eq(events.spotId, spots.id))
    .leftJoin(user, eq(events.userId, user.id))
    .where(eq(events.id, id))
    .limit(1);

  if (!eventWithDetails.length) {
    throw APIException.notFound("Event not found");
  }

  const event = eventWithDetails[0];

  // Check access permissions (event is visible if the spot is public or user owns the spot/event)
  const canAccess = 
    (event.spot?.visibility === "public" && event.spot?.status === "approved") ||
    event.userId === currentUser.id ||
    event.spot?.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canAccess) {
    throw APIException.forbidden("Access denied to this event");
  }

  return NextResponse.json(event);
});

export const PUT = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();
  
  const body = await request.json();
  const validatedData = updateEventSchema.parse(body);

  // Check if event exists
  const existingEvent = await db
    .select({ userId: events.userId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!existingEvent.length) {
    throw APIException.notFound("Event not found");
  }

  const event = existingEvent[0];

  // Check permissions (only event creator or admin/moderator can edit)
  const canEdit = 
    event.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canEdit) {
    throw APIException.forbidden("Access denied");
  }

  // Validate time constraints if both times are being updated
  if (validatedData.startTime && validatedData.endTime) {
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);
    
    if (startTime >= endTime) {
      throw APIException.badRequest("Start time must be before end time");
    }
  }

  const updateData: Record<string, unknown> = { ...validatedData };
  if (updateData.startTime && typeof updateData.startTime === 'string') {
    updateData.startTime = new Date(updateData.startTime);
  }
  if (updateData.endTime && typeof updateData.endTime === 'string') {
    updateData.endTime = new Date(updateData.endTime);
  }

  await db
    .update(events)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  // Get the updated event with full details
  const eventWithDetails = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startTime: events.startTime,
      endTime: events.endTime,
      isRecurring: events.isRecurring,
      recurrenceData: events.recurrenceData,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      spot: {
        id: spots.id,
        name: spots.name,
        description: spots.description,
        locationLat: spots.locationLat,
        locationLng: spots.locationLng,
        spotType: spots.spotType,
        difficulty: spots.difficulty,
        visibility: spots.visibility,
      },
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(events)
    .leftJoin(spots, eq(events.spotId, spots.id))
    .leftJoin(user, eq(events.userId, user.id))
    .where(eq(events.id, id))
    .limit(1);

  return NextResponse.json(eventWithDetails[0]);
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const currentUser = await validateSession();

  // Check if event exists
  const existingEvent = await db
    .select({ userId: events.userId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!existingEvent.length) {
    throw APIException.notFound("Event not found");
  }

  const event = existingEvent[0];

  // Check permissions (only event creator or admin/moderator can delete)
  const canDelete = 
    event.userId === currentUser.id ||
    currentUser.role === "admin" ||
    currentUser.role === "moderator";

  if (!canDelete) {
    throw APIException.forbidden("Access denied");
  }

  await db.delete(events).where(eq(events.id, id));

  return NextResponse.json({ message: "Event deleted successfully" });
});
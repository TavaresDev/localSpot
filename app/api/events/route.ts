import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { events, spots, user } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling, APIException } from "@/lib/api-error";
import { eq, and, or, gte, lte, desc, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

const createEventSchema = z.object({
  spotId: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isRecurring: z.boolean().default(false),
  recurrenceData: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    interval: z.number().min(1).max(12),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

const eventQuerySchema = z.object({
  spotId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(["newest", "oldest", "startTime", "endTime"]).default("startTime"),
  upcoming: z.coerce.boolean().default(false),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const params = eventQuerySchema.parse(Object.fromEntries(searchParams));
  
  const currentUser = await validateSession();

  // Build all conditions first
  const conditions = [
    eq(spots.status, "approved"),
    or(
      eq(spots.visibility, "public"),
      eq(events.userId, currentUser.id)
    )
  ];

  // Apply filters
  if (params.spotId) {
    conditions.push(eq(events.spotId, params.spotId));
  }

  if (params.userId) {
    conditions.push(eq(events.userId, params.userId));
  }

  if (params.startDate) {
    conditions.push(gte(events.startTime, new Date(params.startDate)));
  }

  if (params.endDate) {
    conditions.push(lte(events.endTime, new Date(params.endDate)));
  }

  if (params.upcoming) {
    conditions.push(gte(events.startTime, new Date()));
  }

  // Build sorting
  let orderByClause;
  switch (params.sort) {
    case "newest":
      orderByClause = desc(events.createdAt);
      break;
    case "oldest":
      orderByClause = asc(events.createdAt);
      break;
    case "startTime":
      orderByClause = asc(events.startTime);
      break;
    case "endTime":
      orderByClause = asc(events.endTime);
      break;
    default:
      orderByClause = asc(events.startTime);
  }

  const query = db
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
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  const results = await query;

  return NextResponse.json({
    events: results,
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
  const validatedData = createEventSchema.parse(body);

  // Validate that start time is before end time
  const startTime = new Date(validatedData.startTime);
  const endTime = new Date(validatedData.endTime);
  
  if (startTime >= endTime) {
    throw APIException.badRequest("Start time must be before end time");
  }

  // Check if spot exists and is accessible
  const spot = await db
    .select({ 
      id: spots.id, 
      userId: spots.userId, 
      visibility: spots.visibility,
      status: spots.status 
    })
    .from(spots)
    .where(eq(spots.id, validatedData.spotId))
    .limit(1);

  if (!spot.length) {
    throw APIException.notFound("Spot not found");
  }

  const spotData = spot[0];

  // Check if user can create events for this spot
  const canCreateEvent = 
    spotData.visibility === "public" &&
    spotData.status === "approved";

  if (!canCreateEvent && spotData.userId !== currentUser.id) {
    throw APIException.forbidden("Cannot create events for this spot");
  }

  const newEvent = {
    id: nanoid(),
    userId: currentUser.id,
    spotId: validatedData.spotId,
    title: validatedData.title,
    description: validatedData.description,
    startTime: startTime,
    endTime: endTime,
    isRecurring: validatedData.isRecurring,
    recurrenceData: validatedData.recurrenceData,
  };

  const [createdEvent] = await db
    .insert(events)
    .values(newEvent)
    .returning();

  // Get the event with spot and user data
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
    .where(eq(events.id, createdEvent.id))
    .limit(1);

  return NextResponse.json(eventWithDetails[0], { status: 201 });
});
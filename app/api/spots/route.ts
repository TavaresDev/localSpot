import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { spots, user } from "@/db/schema";
import { validateSession } from "@/lib/auth-server";
import { withErrorHandling } from "@/lib/api-error";
import { eq, and, or, desc, asc, ilike, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { SPOT_TYPES, SPOT_DIFFICULTIES, SPOT_VISIBILITIES } from "@/lib/types/spots";

const createSpotSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  spotType: z.enum(SPOT_TYPES),
  difficulty: z.enum(SPOT_DIFFICULTIES),
  visibility: z.enum(SPOT_VISIBILITIES).default("public"),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  endLat: z.number().min(-90).max(90).optional(),
  endLng: z.number().min(-180).max(180).optional(),
  bestTimes: z.string().max(500).optional(),
  safetyNotes: z.string().max(1000).optional(),
  rules: z.string().max(1000).optional(),
  photos: z.array(z.string()).default([]),
});

const spotQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(50000).default(10000),
  type: z.string().optional(),
  difficulty: z.string().optional(),
  visibility: z.string().optional(),
  userId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(["newest", "oldest", "name", "distance"]).default("newest"),
  search: z.string().optional(),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const params = spotQuerySchema.parse(Object.fromEntries(searchParams));
  
  // Try to get current user but don't require authentication
  const currentUser = await validateSession().catch(() => null);

  // Build all conditions first
  const conditions = [];

  // Visibility filter
  if (params.visibility) {
    if (params.visibility === "private" && currentUser) {
      conditions.push(
        and(
          eq(spots.visibility, "private"),
          eq(spots.userId, currentUser.id)
        )
      );
    } else {
      conditions.push(eq(spots.visibility, params.visibility));
    }
  } else {
    if (currentUser) {
      // Authenticated: show public spots OR user's own spots
      conditions.push(
        or(
          eq(spots.visibility, "public"),
          eq(spots.userId, currentUser.id)
        )
      );
    } else {
      // Unauthenticated: only show public spots
      conditions.push(eq(spots.visibility, "public"));
    }
  }

  // Status filter
  if (currentUser) {
    // Authenticated: show approved spots OR user's own spots
    conditions.push(
      or(
        eq(spots.status, "approved"),
        eq(spots.userId, currentUser.id)
      )
    );
  } else {
    // Unauthenticated: only show approved spots
    conditions.push(eq(spots.status, "approved"));
  }

  // Apply additional filters
  if (params.type) {
    conditions.push(eq(spots.spotType, params.type));
  }

  if (params.difficulty) {
    conditions.push(eq(spots.difficulty, params.difficulty));
  }

  if (params.userId) {
    conditions.push(eq(spots.userId, params.userId));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(spots.name, `%${params.search}%`),
        ilike(spots.description, `%${params.search}%`)
      )
    );
  }

  // Apply distance filter if coordinates provided
  if (params.lat && params.lng) {
    const distance = sql`ST_DWithin(
      ST_SetSRID(ST_MakePoint(${spots.locationLng}, ${spots.locationLat}), 4326),
      ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326),
      ${params.radius}
    )`;
    conditions.push(distance);
  }

  // Determine sorting
  let orderByClause;
  switch (params.sort) {
    case "newest":
      orderByClause = desc(spots.createdAt);
      break;
    case "oldest":
      orderByClause = asc(spots.createdAt);
      break;
    case "name":
      orderByClause = asc(spots.name);
      break;
    case "distance":
      if (params.lat && params.lng) {
        orderByClause = sql`ST_Distance(
          ST_SetSRID(ST_MakePoint(${spots.locationLng}, ${spots.locationLat}), 4326),
          ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)
        )`;
      } else {
        orderByClause = desc(spots.createdAt);
      }
      break;
    default:
      orderByClause = desc(spots.createdAt);
  }

  // Build the complete query in one go
  const query = db
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
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(params.offset);

  const results = await query;

  return NextResponse.json({
    spots: results,
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
  const validatedData = createSpotSchema.parse(body);

  // Determine initial status based on user role
  let initialStatus = "pending";
  if (currentUser.role === "admin" || currentUser.role === "moderator") {
    initialStatus = "approved";
  }

  const newSpot = {
    id: nanoid(),
    userId: currentUser.id,
    status: initialStatus,
    ...validatedData,
    locationLat: validatedData.locationLat.toString(),
    locationLng: validatedData.locationLng.toString(),
    startLat: validatedData.startLat?.toString(),
    startLng: validatedData.startLng?.toString(),
    endLat: validatedData.endLat?.toString(),
    endLng: validatedData.endLng?.toString(),
  };

  const [createdSpot] = await db
    .insert(spots)
    .values(newSpot)
    .returning();

  // Get the spot with user data
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
    .where(eq(spots.id, createdSpot.id))
    .limit(1);

  return NextResponse.json(spotWithUser[0], { status: 201 });
});
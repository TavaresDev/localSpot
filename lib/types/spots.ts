import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { spots, events, collections, moderationQueue } from "@/db/schema";

export type Spot = InferSelectModel<typeof spots>;
export type NewSpot = InferInsertModel<typeof spots>;

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

export type Collection = InferSelectModel<typeof collections>;
export type NewCollection = InferInsertModel<typeof collections>;

export type ModerationQueue = InferSelectModel<typeof moderationQueue>;
export type NewModerationQueue = InferInsertModel<typeof moderationQueue>;

export type SpotType = 
  | "downhill"
  | "freeride"
  | "freestyle"
  | "cruising"
  | "dancing"
  | "pumping";

export type SpotDifficulty = 
  | "beginner"
  | "intermediate" 
  | "advanced"
  | "expert";

export type SpotVisibility = 
  | "public"
  | "private"
  | "friends";

export type SpotStatus = 
  | "pending"
  | "approved"
  | "rejected";

export type UserRole = 
  | "user"
  | "moderator"
  | "admin";

export type ModerationStatus = 
  | "pending"
  | "approved"
  | "rejected";

export interface SpotWithUser extends Spot {
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface EventWithSpot extends Event {
  spot: Spot;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

// Essential interfaces for MVP
export interface RecurrenceData {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  endDate?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

// Form types for creating/updating
export type CreateSpotForm = Omit<NewSpot, "id" | "userId" | "createdAt" | "updatedAt" | "status">;
export type UpdateSpotForm = Partial<CreateSpotForm>;

export type CreateEventForm = Omit<NewEvent, "id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateEventForm = Partial<Omit<CreateEventForm, "spotId">>;

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Zod schema helpers for API validation
export const SPOT_TYPES = ["downhill", "freeride", "freestyle", "cruising", "dancing", "pumping"] as const;
export const SPOT_DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"] as const;
export const SPOT_VISIBILITIES = ["public", "private", "friends"] as const;
export const SPOT_STATUSES = ["pending", "approved", "rejected"] as const;
export const USER_ROLES = ["user", "moderator", "admin"] as const;
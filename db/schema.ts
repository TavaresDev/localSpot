import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  real,
  jsonb,
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// SpotMap Longboarding Tables
export const spots = pgTable("spots", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  locationLat: real("locationLat").notNull(),
  locationLng: real("locationLng").notNull(),
  visibility: text("visibility").notNull().default("public"),
  spotType: text("spotType").notNull(),
  difficulty: text("difficulty").notNull(),
  startLat: real("startLat"),
  startLng: real("startLng"),
  endLat: real("endLat"),
  endLng: real("endLng"),
  bestTimes: text("bestTimes"),
  safetyNotes: text("safetyNotes"),
  rules: text("rules"),
  photos: jsonb("photos").default([]),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  spotId: text("spotId")
    .notNull()
    .references(() => spots.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  isRecurring: boolean("isRecurring").notNull().default(false),
  recurrenceData: jsonb("recurrenceData"),
  photos: jsonb("photos").default([]),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const collections = pgTable("collections", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  spotIds: jsonb("spotIds").notNull().default([]),
  isPublic: boolean("isPublic").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const moderationQueue = pgTable("moderationQueue", {
  id: text("id").primaryKey(),
  contentType: text("contentType").notNull(),
  contentId: text("contentId").notNull(),
  status: text("status").notNull().default("pending"),
  moderatorId: text("moderatorId").references(() => user.id),
  reviewedAt: timestamp("reviewedAt"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

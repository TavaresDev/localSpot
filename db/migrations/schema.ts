import { pgTable, text, timestamp, foreignKey, unique, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const subscription = pgTable("subscription", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	modifiedAt: timestamp({ mode: 'string' }),
	amount: integer().notNull(),
	currency: text().notNull(),
	recurringInterval: text().notNull(),
	status: text().notNull(),
	currentPeriodStart: timestamp({ mode: 'string' }).notNull(),
	currentPeriodEnd: timestamp({ mode: 'string' }).notNull(),
	cancelAtPeriodEnd: boolean().default(false).notNull(),
	canceledAt: timestamp({ mode: 'string' }),
	startedAt: timestamp({ mode: 'string' }).notNull(),
	endsAt: timestamp({ mode: 'string' }),
	endedAt: timestamp({ mode: 'string' }),
	customerId: text().notNull(),
	productId: text().notNull(),
	discountId: text(),
	checkoutId: text().notNull(),
	customerCancellationReason: text(),
	customerCancellationComment: text(),
	metadata: text(),
	customFieldData: text(),
	userId: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "subscription_userId_user_id_fk"
		}),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	role: text().default('user').notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const spots = pgTable("spots", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	name: text().notNull(),
	description: text(),
	locationLat: numeric({ precision: 10, scale:  8 }).notNull(),
	locationLng: numeric({ precision: 11, scale:  8 }).notNull(),
	visibility: text().default('public').notNull(),
	spotType: text().notNull(),
	difficulty: text().notNull(),
	startLat: numeric({ precision: 10, scale:  8 }),
	startLng: numeric({ precision: 11, scale:  8 }),
	endLat: numeric({ precision: 10, scale:  8 }),
	endLng: numeric({ precision: 11, scale:  8 }),
	bestTimes: text(),
	safetyNotes: text(),
	rules: text(),
	photos: jsonb().default([]),
	status: text().default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "spots_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const moderationQueue = pgTable("moderationQueue", {
	id: text().primaryKey().notNull(),
	contentType: text().notNull(),
	contentId: text().notNull(),
	status: text().default('pending').notNull(),
	moderatorId: text(),
	reviewedAt: timestamp({ mode: 'string' }),
	feedback: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "moderationQueue_moderatorId_user_id_fk"
		}),
]);

export const collections = pgTable("collections", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	name: text().notNull(),
	spotIds: jsonb().default([]).notNull(),
	isPublic: boolean().default(false).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "collections_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const events = pgTable("events", {
	id: text().primaryKey().notNull(),
	spotId: text().notNull(),
	userId: text().notNull(),
	title: text().notNull(),
	description: text(),
	startTime: timestamp({ mode: 'string' }).notNull(),
	endTime: timestamp({ mode: 'string' }).notNull(),
	isRecurring: boolean().default(false).notNull(),
	recurrenceData: jsonb(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.spotId],
			foreignColumns: [spots.id],
			name: "events_spotId_spots_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "events_userId_user_id_fk"
		}).onDelete("cascade"),
]);

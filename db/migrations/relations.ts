import { relations } from "drizzle-orm/relations";
import { user, account, session, subscription, spots, moderationQueue, collections, events } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	subscriptions: many(subscription),
	spots: many(spots),
	moderationQueues: many(moderationQueue),
	collections: many(collections),
	events: many(events),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const subscriptionRelations = relations(subscription, ({one}) => ({
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id]
	}),
}));

export const spotsRelations = relations(spots, ({one, many}) => ({
	user: one(user, {
		fields: [spots.userId],
		references: [user.id]
	}),
	events: many(events),
}));

export const moderationQueueRelations = relations(moderationQueue, ({one}) => ({
	user: one(user, {
		fields: [moderationQueue.moderatorId],
		references: [user.id]
	}),
}));

export const collectionsRelations = relations(collections, ({one}) => ({
	user: one(user, {
		fields: [collections.userId],
		references: [user.id]
	}),
}));

export const eventsRelations = relations(events, ({one}) => ({
	spot: one(spots, {
		fields: [events.spotId],
		references: [spots.id]
	}),
	user: one(user, {
		fields: [events.userId],
		references: [user.id]
	}),
}));
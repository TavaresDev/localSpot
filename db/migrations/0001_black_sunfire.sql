CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"spotIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"spotId" text NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isRecurring" boolean DEFAULT false NOT NULL,
	"recurrenceData" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderationQueue" (
	"id" text PRIMARY KEY NOT NULL,
	"contentType" text NOT NULL,
	"contentId" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"moderatorId" text,
	"reviewedAt" timestamp,
	"feedback" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spots" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"locationLat" numeric(10, 8) NOT NULL,
	"locationLng" numeric(11, 8) NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"spotType" text NOT NULL,
	"difficulty" text NOT NULL,
	"startLat" numeric(10, 8),
	"startLng" numeric(11, 8),
	"endLat" numeric(10, 8),
	"endLng" numeric(11, 8),
	"bestTimes" text,
	"safetyNotes" text,
	"rules" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_spotId_spots_id_fk" FOREIGN KEY ("spotId") REFERENCES "public"."spots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderationQueue" ADD CONSTRAINT "moderationQueue_moderatorId_user_id_fk" FOREIGN KEY ("moderatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spots" ADD CONSTRAINT "spots_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
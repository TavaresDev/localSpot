# SpotMap Longboarding App - Complete Implementation Plan

## Executive Summary
Building a comprehensive longboarding spots discovery app using the existing Next.js 15 starter kit architecture. The app will feature map-based spot discovery, user-generated content with moderation, events system, and progressive web app capabilities optimized for mobile-first usage in Ontario, Canada.

## Research-Based Architecture Decisions

### Core Technology Stack Analysis
- **Next.js 15.3**: App Router with Server Components, Turbopack for 45.8% faster dev compilation
- **Drizzle ORM 0.43.1**: PostgreSQL with PostGIS extension for geospatial queries
- **Better Auth 1.2.8**: Session-based authentication with role-based access control
- **Google Maps API**: Advanced markers (v3.61+), clustering with supercluster algorithm
- **PWA**: Serwist service worker replacing legacy Workbox, offline-first architecture
- **shadcn/ui**: Extended component library for longboarding-specific interfaces

### Key Research Findings
1. **Next.js 15 Performance**: Turbopack provides 76.7% faster server startup, 96.3% faster code updates
2. **Google Maps Migration**: `google.maps.Marker` deprecated (Feb 2024), must use `AdvancedMarkerElement`
3. **PWA 2025 Standards**: Serwist replaces Workbox, enhanced iOS support, improved caching strategies
4. **Better Auth RBAC**: Built-in organization plugin for hierarchical permissions, audit logging
5. **PostGIS Integration**: Drizzle supports geometry types, spatial indexing, distance calculations

## Phase 1: Database Schema & Core Models

### Enhanced Database Schema
```sql
-- Extend existing user table with longboarding-specific fields
ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
ALTER TABLE user ADD COLUMN profile_data JSONB DEFAULT '{}';
ALTER TABLE user ADD COLUMN location_lat DECIMAL(10, 8);
ALTER TABLE user ADD COLUMN location_lng DECIMAL(11, 8);
ALTER TABLE user ADD COLUMN riding_style TEXT[];
ALTER TABLE user ADD COLUMN experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Longboarding spots with full geospatial support
CREATE TABLE spots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location GEOMETRY(POINT, 4326) NOT NULL, -- PostGIS geometry for spatial queries
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  address TEXT, -- Reverse geocoded address
  visibility TEXT DEFAULT 'community' CHECK (visibility IN ('open', 'community', 'moderator', 'private', 'group')),
  spot_type TEXT NOT NULL CHECK (spot_type IN ('downhill', 'cruising', 'dancing', 'freeride', 'ldp')),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  surface_type TEXT CHECK (surface_type IN ('asphalt', 'concrete', 'boardwalk', 'mixed')),
  surface_quality TEXT CHECK (surface_quality IN ('excellent', 'good', 'fair', 'poor')),
  start_point GEOMETRY(POINT, 4326), -- Route start for downhill spots
  end_point GEOMETRY(POINT, 4326), -- Route end for downhill spots
  route_path GEOMETRY(LINESTRING, 4326), -- Full route geometry
  elevation_gain INTEGER, -- Meters of elevation gain
  length_meters INTEGER, -- Route length in meters
  best_times TEXT[], -- Array of best times to visit ['morning', 'afternoon', 'evening', 'night']
  weather_conditions TEXT[], -- Best weather conditions
  safety_notes TEXT,
  rules TEXT,
  amenities TEXT[], -- ['parking', 'washrooms', 'food', 'shade', 'seating']
  photos TEXT[], -- Array of photo URLs from Cloudflare R2
  photo_metadata JSONB, -- Photo metadata (camera position, timestamps, etc.)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  group_access_code TEXT, -- For group visibility
  tags TEXT[], -- User-defined tags for searching
  traffic_level TEXT CHECK (traffic_level IN ('none', 'low', 'moderate', 'high')),
  lighting TEXT CHECK (lighting IN ('none', 'minimal', 'good', 'excellent')),
  popularity_score DECIMAL(3, 2) DEFAULT 0, -- Calculated popularity metric
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Spatial indexes for performance
CREATE INDEX idx_spots_location ON spots USING GIST (location);
CREATE INDEX idx_spots_bounds ON spots USING GIST (ST_Envelope(location));
CREATE INDEX idx_spots_visibility ON spots (visibility);
CREATE INDEX idx_spots_status ON spots (status);
CREATE INDEX idx_spots_type ON spots (spot_type);
CREATE INDEX idx_spots_difficulty ON spots (difficulty);
CREATE INDEX idx_spots_tags ON spots USING GIN (tags);
CREATE INDEX idx_spots_popularity ON spots (popularity_score DESC);

-- Full-text search index
CREATE INDEX idx_spots_search ON spots USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' '))
);

-- Spot reviews and ratings
CREATE TABLE spot_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  visit_date DATE,
  weather_conditions TEXT,
  equipment_used TEXT, -- Board type, wheels, etc.
  photos TEXT[], -- Review photos
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(spot_id, user_id) -- One review per user per spot
);

-- Events system with recurring support
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('session', 'meetup', 'competition', 'lesson', 'maintenance')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- RRULE-like pattern for recurring events
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  skill_level TEXT[], -- Target skill levels
  equipment_requirements TEXT,
  meeting_point GEOMETRY(POINT, 4326),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'group')),
  registration_required BOOLEAN DEFAULT FALSE,
  contact_info JSONB, -- Contact information for organizer
  weather_dependent BOOLEAN DEFAULT TRUE,
  cancellation_policy TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event participants with RSVP status
CREATE TABLE event_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  joined_at TIMESTAMP DEFAULT NOW(),
  check_in_time TIMESTAMP, -- Actual attendance tracking
  UNIQUE(event_id, user_id)
);

-- User collections/favorites with advanced organization
CREATE TABLE collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6', -- Color coding for collections
  icon TEXT DEFAULT 'star', -- Icon identifier
  spot_ids TEXT[], -- Array of spot IDs
  is_public BOOLEAN DEFAULT FALSE,
  is_collaborative BOOLEAN DEFAULT FALSE, -- Allow other users to contribute
  collaborators TEXT[], -- User IDs who can edit
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Advanced moderation queue with workflow support
CREATE TABLE moderation_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('spot', 'event', 'review', 'user', 'photo')),
  content_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  auto_flags JSONB, -- Automated moderation flags
  community_reports INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  moderator_id TEXT REFERENCES "user"(id),
  feedback TEXT,
  moderation_notes JSONB, -- Internal notes for moderators
  reviewed_at TIMESTAMP,
  escalated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community reporting system
CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL REFERENCES "user"(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('spot', 'event', 'review', 'user', 'comment')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'dangerous', 'incorrect', 'copyright', 'other')),
  description TEXT,
  evidence_urls TEXT[], -- Screenshots or additional evidence
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  resolved_by TEXT REFERENCES "user"(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User activity tracking for gamification
CREATE TABLE user_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('spot_created', 'spot_visited', 'event_attended', 'review_posted', 'photo_uploaded')),
  activity_data JSONB, -- Additional activity context
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements/badges system
CREATE TABLE user_achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Rate limiting table for API protection
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or user ID
  action TEXT NOT NULL, -- API endpoint or action type
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  UNIQUE(identifier, action)
);

-- Audit log for security and compliance
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES "user"(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  additional_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints Structure
```
/api/
├── spots/
│   ├── route.ts                    # GET all spots with filters, POST create spot
│   ├── [id]/
│   │   ├── route.ts               # GET, PUT, DELETE specific spot
│   │   ├── reviews/route.ts       # GET spot reviews, POST new review
│   │   └── photos/route.ts        # GET spot photos, POST upload photo
│   ├── nearby/route.ts            # GET spots near location with radius
│   ├── search/route.ts            # GET spots with full-text search
│   ├── trending/route.ts          # GET trending/popular spots
│   └── export/route.ts            # GET export spots data (GPX, KML)
├── events/
│   ├── route.ts                   # GET all events with filters, POST create event
│   ├── [id]/
│   │   ├── route.ts               # GET, PUT, DELETE specific event
│   │   ├── join/route.ts          # POST join/leave event
│   │   ├── checkin/route.ts       # POST check-in to event
│   │   └── participants/route.ts  # GET event participants
│   ├── calendar/route.ts          # GET events in calendar format
│   ├── recurring/route.ts         # POST create recurring event (moderator only)
│   └── weather/route.ts           # GET weather impact on events
├── collections/
│   ├── route.ts                   # GET user collections, POST create collection
│   ├── [id]/
│   │   ├── route.ts               # GET, PUT, DELETE collection
│   │   ├── spots/route.ts         # POST add/remove spots from collection
│   │   └── share/route.ts         # GET/POST collection sharing
│   └── public/route.ts            # GET public collections
├── users/
│   ├── [id]/
│   │   ├── route.ts               # GET user profile, PUT update profile
│   │   ├── spots/route.ts         # GET user's created spots
│   │   ├── activities/route.ts    # GET user activity history
│   │   └── achievements/route.ts  # GET user achievements
│   ├── leaderboard/route.ts       # GET user leaderboard
│   └── search/route.ts            # GET search users
├── moderation/
│   ├── queue/route.ts             # GET moderation queue (moderator only)
│   ├── approve/route.ts           # POST approve content
│   ├── reject/route.ts            # POST reject content
│   ├── escalate/route.ts          # POST escalate to admin
│   └── stats/route.ts             # GET moderation statistics
├── reports/
│   ├── route.ts                   # POST create report
│   ├── [id]/route.ts              # GET report details (admin/moderator)
│   └── admin/route.ts             # GET all reports (admin only)
├── maps/
│   ├── geocode/route.ts           # GET/POST geocoding services
│   ├── directions/route.ts        # GET route directions between points
│   ├── elevation/route.ts         # GET elevation profile for routes
│   └── tiles/route.ts             # GET custom map tile proxy (if needed)
├── weather/
│   ├── current/route.ts           # GET current weather for location
│   └── forecast/route.ts          # GET weather forecast
├── notifications/
│   ├── route.ts                   # GET user notifications, POST mark as read
│   ├── push/route.ts              # POST send push notification
│   └── settings/route.ts          # GET/PUT notification preferences
└── admin/
    ├── stats/route.ts             # GET system statistics
    ├── users/route.ts             # GET user management
    ├── content/route.ts           # GET content management
    └── system/route.ts            # GET system health and monitoring
```

## Phase 2: Component Architecture

### Map Components
```typescript
// components/map/
├── MapView.tsx                    # Main map container with Google Maps
│   └── Props: { spots, events, userLocation, onSpotClick, onLocationSelect }
├── SpotMarker.tsx                 # Custom marker for longboarding spots
│   └── Props: { spot, isSelected, onClick, clustered }
├── SpotCluster.tsx                # Marker clustering with supercluster
│   └── Props: { spots, map, onClusterClick }
├── DrawingTools.tsx               # Route drawing and area selection
│   └── Props: { map, onRouteDrawn, onAreaSelected, mode }
├── LocationPicker.tsx             # Long-press location selection
│   └── Props: { map, onLocationPicked, enabled }
├── MapControls.tsx                # Zoom, filter, layer controls
│   └── Props: { map, filters, onFiltersChange }
├── RouteViewer.tsx                # Display and interact with routes
│   └── Props: { route, elevation, interactive }
└── OfflineMap.tsx                 # Cached map tiles for offline use
    └── Props: { bounds, cacheLevel, onCacheProgress }

// Spot Management Components  
├── spots/
│   ├── SpotCard.tsx              # Spot display card with actions
│   │   └── Props: { spot, userLocation, showDistance, actions }
│   ├── SpotForm.tsx              # Create/edit spot comprehensive form
│   │   └── Props: { spot?, onSubmit, onCancel, isEdit }
│   ├── SpotDetails.tsx           # Detailed spot view with photos/reviews
│   │   └── Props: { spotId, showReviews, showEvents }
│   ├── SpotFilters.tsx           # Advanced filtering interface
│   │   └── Props: { filters, onFiltersChange, availableFilters }
│   ├── SpotGallery.tsx           # Photo gallery with lightbox
│   │   └── Props: { photos, spot, canUpload, onPhotoUpload }
│   ├── SpotReviews.tsx           # Reviews display and submission
│   │   └── Props: { spotId, reviews, canReview, onReviewSubmit }
│   ├── SpotComparison.tsx        # Side-by-side spot comparison
│   │   └── Props: { spots, criteria, onSpotSelect }
│   └── SpotRoute.tsx             # Route visualization for downhill spots
│       └── Props: { spot, showElevation, interactive }

// Event Components
├── events/
│   ├── EventCard.tsx             # Event display with RSVP
│   │   └── Props: { event, userRSVP, onRSVPChange, showWeather }
│   ├── EventForm.tsx             # Create/edit event form
│   │   └── Props: { event?, onSubmit, onCancel, spotId? }
│   ├── EventCalendar.tsx         # Calendar view with filters
│   │   └── Props: { events, view, onEventClick, filters }
│   ├── EventParticipants.tsx     # Participant management
│   │   └── Props: { eventId, participants, isOrganizer }
│   ├── EventWeather.tsx          # Weather integration for events
│   │   └── Props: { event, forecast, onWeatherAlert }
│   └── RecurringEventForm.tsx    # Recurring event creation (moderators)
│       └── Props: { onSubmit, spotId?, initialPattern }

// User Interface Components
├── navigation/
│   ├── BottomNav.tsx             # Mobile-optimized bottom navigation
│   │   └── Props: { currentPath, notifications }
│   ├── SideNav.tsx               # Desktop sidebar with advanced features
│   │   └── Props: { isCollapsed, onToggle, userRole }
│   ├── TopBar.tsx                # Header with search and user menu
│   │   └── Props: { showSearch, searchValue, onSearchChange }
│   └── BreadcrumbNav.tsx         # Breadcrumb navigation
│       └── Props: { path, customLabels }

├── search/
│   ├── SearchBar.tsx             # Advanced search with autocomplete
│   │   └── Props: { onSearch, filters, suggestions, recent }
│   ├── SearchFilters.tsx         # Comprehensive filter panel
│   │   └── Props: { filters, onFiltersChange, searchType }
│   ├── SearchResults.tsx         # Results display with sorting
│   │   └── Props: { results, type, sortBy, onSort }
│   └── SavedSearches.tsx         # User's saved search queries
│       └── Props: { searches, onSearchSelect, onSearchDelete }

├── moderation/
│   ├── ModerationPanel.tsx       # Content review interface
│   │   └── Props: { queueItems, onApprove, onReject, onEscalate }
│   ├── ModerationQueue.tsx       # Queue management with filters
│   │   └── Props: { queue, filters, userRole, onAction }
│   ├── ReportForm.tsx            # Content reporting form
│   │   └── Props: { contentType, contentId, onSubmit }
│   ├── ModerationStats.tsx       # Statistics dashboard
│   │   └── Props: { stats, timeframe, userRole }
│   └── AutoModerationRules.tsx   # Automated moderation configuration
│       └── Props: { rules, onRuleChange, canEdit }

├── user/
│   ├── ProfileCard.tsx           # User profile display
│   │   └── Props: { user, isOwner, onFollow, showStats }
│   ├── UserSpots.tsx             # User's created spots
│   │   └── Props: { userId, spots, canEdit, view }
│   ├── UserCollections.tsx       # User's saved collections
│   │   └── Props: { userId, collections, canEdit, isPublic }
│   ├── UserActivities.tsx        # Activity timeline
│   │   └── Props: { userId, activities, showPrivate }
│   ├── UserAchievements.tsx      # Badges and achievements
│   │   └── Props: { userId, achievements, progress }
│   ├── UserSettings.tsx          # Account settings and preferences
│   │   └── Props: { user, onUpdate, sections }
│   └── UserStats.tsx             # User statistics dashboard
│       └── Props: { userId, stats, timeframe }

├── collections/
│   ├── CollectionCard.tsx        # Collection display card
│   │   └── Props: { collection, onOpen, onEdit, showStats }
│   ├── CollectionForm.tsx        # Create/edit collection
│   │   └── Props: { collection?, onSubmit, onCancel }
│   ├── CollectionViewer.tsx      # Collection contents viewer
│   │   └── Props: { collectionId, canEdit, view }
│   └── CollectionSharing.tsx     # Sharing and collaboration
│       └── Props: { collection, onShare, onCollaborate }

└── common/
    ├── LoadingStates.tsx         # Various loading skeletons
    │   └── Props: { type, count, animated }
    ├── ErrorBoundary.tsx         # Enhanced error boundaries
    │   └── Props: { fallback, onError, showDetails }
    ├── EmptyStates.tsx           # Empty state illustrations
    │   └── Props: { type, title, description, action }
    ├── ConfirmDialog.tsx         # Confirmation dialogs
    │   └── Props: { title, message, onConfirm, onCancel }
    ├── ShareDialog.tsx           # Content sharing interface
    │   └── Props: { item, shareUrl, onShare }
    ├── PhotoUpload.tsx           # Photo upload with preview
    │   └── Props: { onUpload, multiple, maxSize, formats }
    ├── LocationDisplay.tsx       # Location formatting and display
    │   └── Props: { location, showDistance, format }
    ├── WeatherWidget.tsx         # Weather information display
    │   └── Props: { location, forecast, compact }
    ├── NotificationCenter.tsx    # In-app notifications
    │   └── Props: { notifications, onAction, onDismiss }
    └── HelpTooltip.tsx           # Contextual help system
        └── Props: { content, placement, trigger }
```

## Phase 3: Advanced Features Implementation

### Geospatial Queries with Drizzle + PostGIS
```typescript
// lib/queries/spots.ts
import { db } from '@/db/drizzle';
import { spots, spotReviews } from '@/db/schema';
import { sql, eq, and, desc, asc } from 'drizzle-orm';

export interface SpotSearchParams {
  lat?: number;
  lng?: number;
  radius?: number; // meters
  spotType?: string[];
  difficulty?: number[];
  minRating?: number;
  searchQuery?: string;
  tags?: string[];
  visibility?: string[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  sortBy?: 'distance' | 'popularity' | 'rating' | 'created' | 'name';
  limit?: number;
  offset?: number;
}

export async function searchSpots(params: SpotSearchParams) {
  let query = db
    .select({
      spot: spots,
      distance: params.lat && params.lng 
        ? sql<number>`ST_Distance(${spots.location}, ST_GeogFromText(${`POINT(${params.lng} ${params.lat})`}))`
        : sql<null>`NULL`,
      avgRating: sql<number>`COALESCE(AVG(${spotReviews.rating}), 0)`,
      reviewCount: sql<number>`COUNT(${spotReviews.id})`
    })
    .from(spots)
    .leftJoin(spotReviews, eq(spots.id, spotReviews.spotId));

  // Geospatial filters
  if (params.lat && params.lng && params.radius) {
    query = query.where(
      sql`ST_DWithin(
        ${spots.location}, 
        ST_GeogFromText(${`POINT(${params.lng} ${params.lat})`}), 
        ${params.radius}
      )`
    );
  }

  if (params.bounds) {
    const { north, south, east, west } = params.bounds;
    query = query.where(
      sql`ST_Within(
        ${spots.location}, 
        ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
      )`
    );
  }

  // Filter conditions
  const conditions = [];
  
  if (params.spotType?.length) {
    conditions.push(sql`${spots.spotType} = ANY(${params.spotType})`);
  }
  
  if (params.difficulty?.length) {
    conditions.push(sql`${spots.difficulty} = ANY(${params.difficulty})`);
  }
  
  if (params.searchQuery) {
    conditions.push(
      sql`to_tsvector('english', ${spots.name} || ' ' || COALESCE(${spots.description}, '') || ' ' || array_to_string(${spots.tags}, ' ')) 
          @@ plainto_tsquery('english', ${params.searchQuery})`
    );
  }
  
  if (params.tags?.length) {
    conditions.push(sql`${spots.tags} && ${params.tags}`);
  }
  
  if (params.visibility?.length) {
    conditions.push(sql`${spots.visibility} = ANY(${params.visibility})`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Group by for aggregations
  query = query.groupBy(spots.id);

  // Rating filter (after aggregation)
  if (params.minRating) {
    query = query.having(sql`COALESCE(AVG(${spotReviews.rating}), 0) >= ${params.minRating}`);
  }

  // Sorting
  switch (params.sortBy) {
    case 'distance':
      if (params.lat && params.lng) {
        query = query.orderBy(sql`ST_Distance(${spots.location}, ST_GeogFromText(${`POINT(${params.lng} ${params.lat})`}))`);
      }
      break;
    case 'popularity':
      query = query.orderBy(desc(spots.popularityScore));
      break;
    case 'rating':
      query = query.orderBy(sql`COALESCE(AVG(${spotReviews.rating}), 0) DESC`);
      break;
    case 'created':
      query = query.orderBy(desc(spots.createdAt));
      break;
    case 'name':
      query = query.orderBy(asc(spots.name));
      break;
    default:
      query = query.orderBy(desc(spots.popularityScore));
  }

  // Pagination
  if (params.limit) {
    query = query.limit(params.limit);
  }
  if (params.offset) {
    query = query.offset(params.offset);
  }

  return query.execute();
}

export async function getNearbySpots(
  lat: number, 
  lng: number, 
  radiusMeters: number = 5000,
  limit: number = 50
) {
  return await db
    .select({
      spot: spots,
      distance: sql<number>`ST_Distance(${spots.location}, ST_GeogFromText(${`POINT(${lng} ${lat})`}))`,
    })
    .from(spots)
    .where(
      and(
        sql`ST_DWithin(
          ${spots.location}, 
          ST_GeogFromText(${`POINT(${lng} ${lat})`}), 
          ${radiusMeters}
        )`,
        eq(spots.status, 'approved')
      )
    )
    .orderBy(sql`ST_Distance(${spots.location}, ST_GeogFromText(${`POINT(${lng} ${lat})`}))`)
    .limit(limit);
}

export async function getSpotsByBounds(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  return await db
    .select()
    .from(spots)
    .where(
      and(
        sql`ST_Within(
          ${spots.location}, 
          ST_MakeEnvelope(${bounds.west}, ${bounds.south}, ${bounds.east}, ${bounds.north}, 4326)
        )`,
        eq(spots.status, 'approved')
      )
    );
}

export async function calculateRouteDistance(spotId: string) {
  const spot = await db.select().from(spots).where(eq(spots.id, spotId)).limit(1);
  
  if (!spot[0]?.routePath) return null;
  
  const result = await db.execute(
    sql`SELECT ST_Length(${spot[0].routePath}::geography) as length_meters`
  );
  
  return result[0]?.length_meters;
}

export async function findSpotsAlongRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  bufferMeters: number = 1000
) {
  return await db
    .select()
    .from(spots)
    .where(
      sql`ST_DWithin(
        ${spots.location}, 
        ST_Buffer(
          ST_MakeLine(
            ST_Point(${startLng}, ${startLat}), 
            ST_Point(${endLng}, ${endLat})
          )::geography, 
          ${bufferMeters}
        ), 
        0
      )`
    );
}
```

### Content Moderation System
```typescript
// lib/moderation.ts
import { db } from '@/db/drizzle';
import { moderationQueue, spots, events, reports, auditLogs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface ModerationResult {
  success: boolean;
  message: string;
  autoApproved?: boolean;
  queueId?: string;
}

export async function submitForModeration(
  contentType: 'spot' | 'event' | 'review',
  contentId: string,
  userId: string,
  additionalData?: Record<string, any>
): Promise<ModerationResult> {
  try {
    // Get user info for moderation rules
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Auto-approve for trusted users
    if (['moderator', 'admin'].includes(user.role)) {
      await approveContent(contentType, contentId, userId);
      await logAuditEvent(userId, 'auto_approve', contentType, contentId);
      return { 
        success: true, 
        message: 'Content auto-approved for trusted user',
        autoApproved: true 
      };
    }

    // Rate limiting check
    const rateLimitResult = await checkSubmissionRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return { 
        success: false, 
        message: `Rate limit exceeded. Try again in ${rateLimitResult.resetInMinutes} minutes.` 
      };
    }

    // Automated content analysis
    const autoFlags = await analyzeContent(contentType, contentId);
    
    // Determine priority based on auto-flags and user history
    const priority = determinePriority(autoFlags, user);
    
    // Add to moderation queue
    const queueId = nanoid();
    await db.insert(moderationQueue).values({
      id: queueId,
      contentType,
      contentId,
      userId,
      priority,
      autoFlags: JSON.stringify(autoFlags),
      status: 'pending',
      createdAt: new Date()
    });

    // Auto-approve low-risk content from established users
    if (shouldAutoApprove(autoFlags, user)) {
      await approveContent(contentType, contentId, 'system');
      await logAuditEvent('system', 'auto_approve', contentType, contentId, { autoFlags });
      return { 
        success: true, 
        message: 'Content auto-approved',
        autoApproved: true 
      };
    }

    await logAuditEvent(userId, 'submit_moderation', contentType, contentId);
    
    return { 
      success: true, 
      message: 'Content submitted for moderation',
      queueId 
    };
  } catch (error) {
    console.error('Moderation submission error:', error);
    return { success: false, message: 'Failed to submit for moderation' };
  }
}

async function checkSubmissionRateLimit(userId: string): Promise<{ allowed: boolean; resetInMinutes?: number }> {
  const user = await getUserById(userId);
  const maxDailySubmissions = user.role === 'user' ? 5 : 20;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(moderationQueue)
    .where(
      and(
        eq(moderationQueue.userId, userId),
        sql`${moderationQueue.createdAt} >= ${today}`
      )
    );

  const currentCount = todayCount[0]?.count || 0;
  
  if (currentCount >= maxDailySubmissions) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const resetInMinutes = Math.ceil((tomorrow.getTime() - Date.now()) / (1000 * 60));
    
    return { allowed: false, resetInMinutes };
  }
  
  return { allowed: true };
}

async function analyzeContent(contentType: string, contentId: string) {
  const flags = {
    hasInappropriateLanguage: false,
    hasLocation: false,
    hasDescription: false,
    hasPhotos: false,
    duplicateLocation: false,
    trustScore: 0.5
  };

  try {
    switch (contentType) {
      case 'spot':
        const spot = await db.select().from(spots).where(eq(spots.id, contentId)).limit(1);
        if (spot[0]) {
          flags.hasLocation = !!(spot[0].locationLat && spot[0].locationLng);
          flags.hasDescription = !!(spot[0].description && spot[0].description.length > 20);
          flags.hasPhotos = !!(spot[0].photos && spot[0].photos.length > 0);
          
          // Check for nearby duplicate spots
          const nearbySpots = await getNearbySpots(spot[0].locationLat, spot[0].locationLng, 100);
          flags.duplicateLocation = nearbySpots.length > 1;
          
          // Basic inappropriate language detection
          const text = `${spot[0].name} ${spot[0].description}`.toLowerCase();
          flags.hasInappropriateLanguage = checkInappropriateLanguage(text);
        }
        break;
      
      case 'event':
        // Similar analysis for events
        break;
    }

    // Calculate trust score
    flags.trustScore = calculateTrustScore(flags);
    
  } catch (error) {
    console.error('Content analysis error:', error);
  }

  return flags;
}

function checkInappropriateLanguage(text: string): boolean {
  const inappropriateWords = ['spam', 'fuck', 'shit', 'damn']; // Extend as needed
  return inappropriateWords.some(word => text.includes(word));
}

function calculateTrustScore(flags: any): number {
  let score = 0.5; // Base score
  
  if (flags.hasLocation) score += 0.2;
  if (flags.hasDescription) score += 0.15;
  if (flags.hasPhotos) score += 0.1;
  if (flags.hasInappropriateLanguage) score -= 0.3;
  if (flags.duplicateLocation) score -= 0.2;
  
  return Math.max(0, Math.min(1, score));
}

function determinePriority(autoFlags: any, user: any): 'low' | 'normal' | 'high' | 'urgent' {
  if (autoFlags.hasInappropriateLanguage || autoFlags.duplicateLocation) {
    return 'high';
  }
  
  if (autoFlags.trustScore < 0.3) {
    return 'high';
  }
  
  if (autoFlags.trustScore > 0.7 && user.role === 'user') {
    return 'low';
  }
  
  return 'normal';
}

function shouldAutoApprove(autoFlags: any, user: any): boolean {
  // Auto-approve high-trust content from established users
  return (
    autoFlags.trustScore > 0.8 &&
    !autoFlags.hasInappropriateLanguage &&
    !autoFlags.duplicateLocation &&
    user.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Account older than 30 days
  );
}

export async function approveContent(
  contentType: string, 
  contentId: string, 
  moderatorId: string,
  feedback?: string
) {
  const transaction = await db.transaction(async (tx) => {
    // Update content status
    switch (contentType) {
      case 'spot':
        await tx.update(spots).set({ status: 'approved' }).where(eq(spots.id, contentId));
        break;
      case 'event':
        await tx.update(events).set({ status: 'approved' }).where(eq(events.id, contentId));
        break;
    }

    // Update moderation queue
    await tx.update(moderationQueue)
      .set({ 
        status: 'approved', 
        moderatorId, 
        feedback,
        reviewedAt: new Date() 
      })
      .where(
        and(
          eq(moderationQueue.contentType, contentType),
          eq(moderationQueue.contentId, contentId)
        )
      );

    return { success: true };
  });

  await logAuditEvent(moderatorId, 'approve_content', contentType, contentId, { feedback });
  return transaction;
}

export async function rejectContent(
  contentType: string, 
  contentId: string, 
  moderatorId: string,
  feedback: string
) {
  const transaction = await db.transaction(async (tx) => {
    // Update content status
    switch (contentType) {
      case 'spot':
        await tx.update(spots).set({ status: 'rejected' }).where(eq(spots.id, contentId));
        break;
      case 'event':
        await tx.update(events).set({ status: 'rejected' }).where(eq(events.id, contentId));
        break;
    }

    // Update moderation queue
    await tx.update(moderationQueue)
      .set({ 
        status: 'rejected', 
        moderatorId, 
        feedback,
        reviewedAt: new Date() 
      })
      .where(
        and(
          eq(moderationQueue.contentType, contentType),
          eq(moderationQueue.contentId, contentId)
        )
      );

    return { success: true };
  });

  await logAuditEvent(moderatorId, 'reject_content', contentType, contentId, { feedback });
  return transaction;
}

async function logAuditEvent(
  userId: string, 
  action: string, 
  resourceType: string, 
  resourceId: string,
  additionalData?: any
) {
  await db.insert(auditLogs).values({
    id: nanoid(),
    userId,
    action,
    resourceType,
    resourceId,
    additionalData: additionalData ? JSON.stringify(additionalData) : null,
    createdAt: new Date()
  });
}
```

## Phase 4: Progressive Web App Implementation

### PWA Configuration with Serwist (Modern Service Worker)
```typescript
// next.config.ts
import withSerwist from '@serwist/next';

const nextConfig = {
  experimental: {
    ppr: 'incremental', // Partial Pre-rendering for better performance
    reactCompiler: true, // React 19 compiler optimizations
    after: true, // after() API for cleanup
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Maps images
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com', // Cloudflare R2
      },
    ],
  },
};

export default withSerwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  register: false, // Manual registration for better control
})(nextConfig);

// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpotMap - Longboarding Spots Ontario',
    short_name: 'SpotMap',
    description: 'Discover, share, and explore longboarding spots across Ontario with the community',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    categories: ['sports', 'lifestyle', 'navigation', 'social'],
    screenshots: [
      {
        src: '/screenshots/mobile-map.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'SpotMap showing longboarding spots on map'
      },
      {
        src: '/screenshots/desktop-dashboard.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'SpotMap dashboard with spot management'
      }
    ],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Find Nearby Spots',
        short_name: 'Nearby',
        description: 'Discover longboarding spots near your location',
        url: '/spots/nearby',
        icons: [{ src: '/icons/shortcut-nearby.png', sizes: '96x96' }]
      },
      {
        name: 'Create New Spot',
        short_name: 'Add Spot',
        description: 'Add a new longboarding spot',
        url: '/spots/create',
        icons: [{ src: '/icons/shortcut-add.png', sizes: '96x96' }]
      },
      {
        name: 'Upcoming Events',
        short_name: 'Events',
        description: 'View upcoming longboarding events',
        url: '/events',
        icons: [{ src: '/icons/shortcut-events.png', sizes: '96x96' }]
      }
    ],
    related_applications: [
      {
        platform: 'webapp',
        url: 'https://spotmap.app/manifest.json'
      }
    ],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400
    }
  };
}
```

### Advanced Service Worker with Offline Support
```typescript
// app/sw.ts
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from '@serwist/precaching';
import { Serwist } from 'serwist';
import { BackgroundSync } from '@serwist/background-sync';
import { BroadcastUpdatePlugin } from '@serwist/broadcast-update';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// Background sync for offline actions
const bgSync = new BackgroundSync('spotmap-actions', {
  maxRetentionTime: 24 * 60, // 24 hours
});

// Broadcast updates for real-time sync
const broadcastUpdate = new BroadcastUpdatePlugin();

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
  runtimeCaching: [
    // Essential app shell
    ...defaultCache,
    
    // Google Maps API caching
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-maps-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
        cacheKeyWillBeUsed: async ({ request }) => {
          // Remove API key from cache key for security
          const url = new URL(request.url);
          url.searchParams.delete('key');
          return url.toString();
        },
      },
    },
    
    // Google Maps tiles
    {
      urlPattern: /^https:\/\/.*\.googleapis\.com\/.*\/tiles\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-maps-tiles',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    
    // Spots API with background sync
    {
      urlPattern: /\/api\/spots/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'spots-api',
        networkTimeoutSeconds: 5,
        plugins: [
          bgSync,
          broadcastUpdate,
        ],
        backgroundSync: {
          name: 'spots-sync',
          options: {
            maxRetentionTime: 24 * 60, // 24 hours
          },
        },
      },
    },
    
    // Events API
    {
      urlPattern: /\/api\/events/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'events-api',
        networkTimeoutSeconds: 5,
        plugins: [broadcastUpdate],
      },
    },
    
    // User data
    {
      urlPattern: /\/api\/users/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'users-api',
        networkTimeoutSeconds: 3,
      },
    },
    
    // Static images from Cloudflare R2
    {
      urlPattern: /.*\.r2\.cloudflarestorage\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'spot-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    
    // Weather API
    {
      urlPattern: /\/api\/weather/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'weather-api',
        expiration: {
          maxAgeSeconds: 60 * 30, // 30 minutes
        },
      },
    },
  ],
});

// Custom event listeners
serwist.addEventListeners();

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'spot-creation') {
    event.waitUntil(syncSpotCreation());
  } else if (event.tag === 'event-rsvp') {
    event.waitUntil(syncEventRSVP());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  
  if (action === 'dismiss') {
    notification.close();
    return;
  }
  
  // Default action or 'view' action
  event.waitUntil(
    clients.openWindow(notification.data?.url || '/')
  );
  
  notification.close();
});

// Offline sync functions
async function syncSpotCreation() {
  try {
    const db = await openDB();
    const pendingSpots = await db.getAll('pending-spots');
    
    for (const spot of pendingSpots) {
      try {
        const response = await fetch('/api/spots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(spot.data),
        });
        
        if (response.ok) {
          await db.delete('pending-spots', spot.id);
          
          // Show success notification
          self.registration.showNotification('Spot Created', {
            body: `Your spot "${spot.data.name}" has been created successfully!`,
            icon: '/icons/icon-192x192.png',
          });
        }
      } catch (error) {
        console.error('Failed to sync spot:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

async function syncEventRSVP() {
  try {
    const db = await openDB();
    const pendingRSVPs = await db.getAll('pending-rsvps');
    
    for (const rsvp of pendingRSVPs) {
      try {
        const response = await fetch(`/api/events/${rsvp.eventId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: rsvp.status }),
        });
        
        if (response.ok) {
          await db.delete('pending-rsvps', rsvp.id);
        }
      } catch (error) {
        console.error('Failed to sync RSVP:', error);
      }
    }
  } catch (error) {
    console.error('RSVP sync error:', error);
  }
}

// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SpotMapOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-spots')) {
        db.createObjectStore('pending-spots', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pending-rsvps')) {
        db.createObjectStore('pending-rsvps', { keyPath: 'id' });
      }
    };
  });
}
```

### PWA Installation and Offline Detection
```typescript
// hooks/usePWA.ts
'use client';

import { useState, useEffect } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSInstalled = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSInstalled);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
  };
}

// hooks/useOfflineSync.ts
'use client';

import { useState, useEffect } from 'react';

interface PendingAction {
  id: string;
  type: 'spot' | 'event' | 'rsvp';
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadPendingActions();
    
    // Listen for online events to sync
    const handleOnline = () => {
      syncPendingActions();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const addPendingAction = async (type: string, data: any) => {
    const action: PendingAction = {
      id: Date.now().toString(),
      type: type as any,
      data,
      timestamp: Date.now(),
    };

    try {
      const db = await openIndexedDB();
      await db.add('pending-actions', action);
      setPendingActions(prev => [...prev, action]);
      
      // Try to sync immediately if online
      if (navigator.onLine) {
        syncPendingActions();
      }
    } catch (error) {
      console.error('Failed to save pending action:', error);
    }
  };

  const syncPendingActions = async () => {
    if (isSyncing || !navigator.onLine) return;

    setIsSyncing(true);
    
    try {
      const db = await openIndexedDB();
      const actions = await db.getAll('pending-actions');
      
      for (const action of actions) {
        try {
          let endpoint = '';
          let method = 'POST';
          
          switch (action.type) {
            case 'spot':
              endpoint = '/api/spots';
              break;
            case 'event':
              endpoint = '/api/events';
              break;
            case 'rsvp':
              endpoint = `/api/events/${action.data.eventId}/join`;
              break;
          }
          
          const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data),
          });
          
          if (response.ok) {
            await db.delete('pending-actions', action.id);
            setPendingActions(prev => prev.filter(a => a.id !== action.id));
          }
        } catch (error) {
          console.error('Failed to sync action:', error);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadPendingActions = async () => {
    try {
      const db = await openIndexedDB();
      const actions = await db.getAll('pending-actions');
      setPendingActions(actions);
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  return {
    pendingActions,
    isSyncing,
    addPendingAction,
    syncPendingActions,
  };
}

async function openIndexedDB() {
  return new Promise<any>((resolve, reject) => {
    const request = indexedDB.open('SpotMapOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        add: (store: string, data: any) => {
          const transaction = db.transaction([store], 'readwrite');
          return transaction.objectStore(store).add(data);
        },
        getAll: (store: string) => {
          return new Promise((resolve) => {
            const transaction = db.transaction([store], 'readonly');
            const request = transaction.objectStore(store).getAll();
            request.onsuccess = () => resolve(request.result);
          });
        },
        delete: (store: string, key: any) => {
          const transaction = db.transaction([store], 'readwrite');
          return transaction.objectStore(store).delete(key);
        },
      });
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id' });
      }
    };
  });
}
```

## Phase 5: Advanced Google Maps Integration

### Modern Maps Implementation with Advanced Markers
```typescript
// components/map/MapView.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import type { Spot } from '@/lib/types';

interface MapViewProps {
  spots: Spot[];
  userLocation?: { lat: number; lng: number };
  onSpotClick?: (spot: Spot) => void;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  showDrawingTools?: boolean;
  selectedSpotId?: string;
  className?: string;
}

export function MapView({
  spots,
  userLocation,
  onSpotClick,
  onLocationSelect,
  onBoundsChanged,
  showDrawingTools = false,
  selectedSpotId,
  className
}: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const [center, setCenter] = useState(
    userLocation || { lat: 43.6532, lng: -79.3832 } // Default to Toronto
  );

  // Update center when user location changes
  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  }, [userLocation]);

  // Handle spot markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => {
      marker.map = null;
    });

    if (clusterer) {
      clusterer.clearMarkers();
    }

    // Create new markers
    const newMarkers = spots.map(spot => {
      const isSelected = spot.id === selectedSpotId;
      const pinElement = createSpotPin(spot, isSelected);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: spot.locationLat, lng: spot.locationLng },
        content: pinElement,
        title: spot.name,
        gmpClickable: true,
      });

      // Add click listener
      marker.addListener('click', () => {
        onSpotClick?.(spot);
      });

      return marker;
    });

    // Add user location marker if available
    if (userLocation) {
      const userPin = new google.maps.marker.PinElement({
        background: '#4285f4',
        borderColor: '#ffffff',
        glyph: '📍',
        scale: 1.2,
      });

      const userMarker = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        content: userPin.element,
        title: 'Your Location',
      });

      newMarkers.push(userMarker);
    }

    // Setup clustering
    const newClusterer = new MarkerClusterer({
      map,
      markers: newMarkers,
      algorithm: new SuperClusterAlgorithm({ 
        radius: 100,
        maxZoom: 16,
        minPoints: 3
      }),
      renderer: {
        render: ({ count, position }) => {
          const clusterPin = new google.maps.marker.PinElement({
            background: '#2563eb',
            borderColor: '#ffffff',
            glyph: count.toString(),
            glyphColor: '#ffffff',
            scale: Math.min(1.5, 1 + count / 20),
          });

          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: clusterPin.element,
          });
        },
      },
    });

    setMarkers(newMarkers);
    setClusterer(newClusterer);

    return () => {
      newMarkers.forEach(marker => marker.map = null);
      newClusterer.clearMarkers();
    };
  }, [map, spots, selectedSpotId, userLocation, onSpotClick]);

  // Handle bounds change
  const handleBoundsChanged = useCallback(() => {
    if (map && onBoundsChanged) {
      const bounds = map.getBounds();
      if (bounds) {
        onBoundsChanged(bounds);
      }
    }
  }, [map, onBoundsChanged]);

  // Handle context menu for location selection
  const handleContextMenu = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onLocationSelect) {
      onLocationSelect({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [onLocationSelect]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <APIProvider 
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={['marker', 'geometry', 'drawing']}
      >
        <Map
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          center={center}
          zoom={userLocation ? 12 : 10}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
          onLoad={setMap}
          onBoundsChanged={handleBoundsChanged}
          onContextmenu={handleContextMenu}
          mapTypeControl={true}
          zoomControl={true}
          streetViewControl={false}
          fullscreenControl={true}
          styles={[
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]}
        >
          {showDrawingTools && (
            <DrawingManager map={map} />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

function createSpotPin(spot: Spot, isSelected: boolean) {
  const colors = {
    downhill: '#ef4444',    // Red
    cruising: '#3b82f6',    // Blue
    dancing: '#8b5cf6',     // Purple
    freeride: '#f59e0b',    // Amber
    ldp: '#10b981',         // Emerald
  };

  const icons = {
    downhill: '⛷️',
    cruising: '🛹',
    dancing: '💃',
    freeride: '🔥',
    ldp: '🏃',
  };

  const pin = new google.maps.marker.PinElement({
    background: isSelected ? '#1f2937' : colors[spot.spotType] || '#6b7280',
    borderColor: '#ffffff',
    glyph: icons[spot.spotType] || '📍',
    glyphColor: '#ffffff',
    scale: isSelected ? 1.3 : 1.0,
  });

  return pin.element;
}

// Drawing Manager Component
function DrawingManager({ map }: { map: google.maps.Map | null }) {
  const drawingLibrary = useMapsLibrary('drawing');
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  useEffect(() => {
    if (!drawingLibrary || !map) return;

    const manager = new drawingLibrary.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
      polylineOptions: {
        fillColor: '#2563eb',
        fillOpacity: 0.5,
        strokeWeight: 3,
        strokeColor: '#2563eb',
        clickable: false,
        editable: true,
        zIndex: 1,
      },
    });

    manager.setMap(map);

    // Listen for drawing completion
    manager.addListener('overlaycomplete', (event) => {
      console.log('Drawing completed:', event);
      // Handle the drawn shape
    });

    setDrawingManager(manager);

    return () => {
      manager.setMap(null);
    };
  }, [drawingLibrary, map]);

  return null;
}

// Elevation Profile Component
export function ElevationProfile({ 
  path, 
  onPathChange 
}: { 
  path: google.maps.LatLng[]; 
  onPathChange?: (elevation: any[]) => void;
}) {
  const map = useMap();
  const [elevationData, setElevationData] = useState<any[]>([]);

  useEffect(() => {
    if (!map || !path.length) return;

    const elevator = new google.maps.ElevationService();
    
    elevator.getElevationAlongPath({
      path,
      samples: 256,
    }, (results, status) => {
      if (status === 'OK' && results) {
        const data = results.map((result, index) => ({
          distance: (index / results.length) * getTotalDistance(path),
          elevation: result.elevation,
          location: result.location,
        }));
        
        setElevationData(data);
        onPathChange?.(data);
      }
    });
  }, [map, path, onPathChange]);

  return null;
}

function getTotalDistance(path: google.maps.LatLng[]): number {
  let distance = 0;
  for (let i = 1; i < path.length; i++) {
    distance += google.maps.geometry.spherical.computeDistanceBetween(
      path[i - 1],
      path[i]
    );
  }
  return distance;
}
```

### Advanced Map Features
```typescript
// components/map/MapControls.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Navigation,
  Zap,
  Mountain,
  Users,
  Calendar
} from 'lucide-react';

interface MapControlsProps {
  filters: {
    spotTypes: string[];
    difficulty: number[];
    showEvents: boolean;
    showUserLocation: boolean;
    mapType: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  };
  onFiltersChange: (filters: any) => void;
  onMyLocation: () => void;
  onRefresh: () => void;
  className?: string;
}

export function MapControls({
  filters,
  onFiltersChange,
  onMyLocation,
  onRefresh,
  className
}: MapControlsProps) {
  const spotTypes = [
    { value: 'downhill', label: 'Downhill', icon: '⛷️' },
    { value: 'cruising', label: 'Cruising', icon: '🛹' },
    { value: 'dancing', label: 'Dancing', icon: '💃' },
    { value: 'freeride', label: 'Freeride', icon: '🔥' },
    { value: 'ldp', label: 'LDP', icon: '🏃' },
  ];

  const difficulties = [
    { value: 1, label: 'Beginner', color: 'bg-green-500' },
    { value: 2, label: 'Easy', color: 'bg-blue-500' },
    { value: 3, label: 'Intermediate', color: 'bg-yellow-500' },
    { value: 4, label: 'Advanced', color: 'bg-orange-500' },
    { value: 5, label: 'Expert', color: 'bg-red-500' },
  ];

  const handleSpotTypeToggle = (spotType: string) => {
    const newTypes = filters.spotTypes.includes(spotType)
      ? filters.spotTypes.filter(t => t !== spotType)
      : [...filters.spotTypes, spotType];
    
    onFiltersChange({ ...filters, spotTypes: newTypes });
  };

  const handleDifficultyToggle = (difficulty: number) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    
    onFiltersChange({ ...filters, difficulty: newDifficulties });
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMyLocation}
            className="flex items-center gap-1"
          >
            <Navigation className="h-4 w-4" />
            My Location
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Map Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Layers className="h-4 w-4" />
            Map Type
          </Label>
          <Select
            value={filters.mapType}
            onValueChange={(value) => 
              onFiltersChange({ ...filters, mapType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roadmap">Roadmap</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Spot Types Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Spot Types
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {spotTypes.map((type) => (
              <Button
                key={type.value}
                variant={filters.spotTypes.includes(type.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handleSpotTypeToggle(type.value)}
                className="justify-start text-xs"
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Mountain className="h-4 w-4" />
            Difficulty
          </Label>
          <div className="flex flex-wrap gap-1">
            {difficulties.map((diff) => (
              <Button
                key={diff.value}
                variant={filters.difficulty.includes(diff.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyToggle(diff.value)}
                className={`text-xs ${
                  filters.difficulty.includes(diff.value) 
                    ? diff.color 
                    : 'hover:' + diff.color.replace('bg-', 'bg-').replace('-500', '-100')
                }`}
              >
                {diff.value}
              </Button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Show Events
            </Label>
            <Switch
              checked={filters.showEvents}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, showEvents: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-1">
              <Users className="h-4 w-4" />
              User Location
            </Label>
            <Switch
              checked={filters.showUserLocation}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, showUserLocation: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Phase 6: User Experience & Mobile Optimization

### Mobile-First Navigation System
```typescript
// components/navigation/BottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Mountain, 
  Calendar, 
  Heart, 
  User,
  Plus,
  Bell
} from 'lucide-react';

interface BottomNavProps {
  notifications?: number;
  className?: string;
}

export function BottomNav({ notifications = 0, className }: BottomNavProps) {
  const pathname = usePathname();
  
  const navItems = [
    { 
      href: '/', 
      icon: MapPin, 
      label: 'Map',
      matches: ['/', '/spots/nearby']
    },
    { 
      href: '/spots', 
      icon: Mountain, 
      label: 'Spots',
      matches: ['/spots', '/spots/search']
    },
    { 
      href: '/spots/create', 
      icon: Plus, 
      label: 'Add',
      matches: ['/spots/create'],
      isAction: true
    },
    { 
      href: '/events', 
      icon: Calendar, 
      label: 'Events',
      matches: ['/events']
    },
    { 
      href: '/profile', 
      icon: User, 
      label: 'Profile',
      matches: ['/profile', '/settings', '/collections'],
      badge: notifications
    },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden",
      className
    )}>
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = item.matches.some(match => 
            match === '/' ? pathname === match : pathname.startsWith(match)
          );
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                item.isAction && !isActive && "bg-primary/5 hover:bg-primary/10"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110",
                  item.isAction && "text-primary"
                )} />
                
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] min-w-[16px]"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium transition-all",
                isActive && "font-semibold",
                item.isAction && !isActive && "text-primary"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with bottom indicators */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}

// components/navigation/TopBar.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface TopBarProps {
  user?: any;
  onSearch?: (query: string) => void;
  onMenuToggle?: () => void;
  showSearch?: boolean;
  notifications?: number;
  className?: string;
}

export function TopBar({
  user,
  onSearch,
  onMenuToggle,
  showSearch = true,
  notifications = 0,
  className
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isInstallable, installApp } = usePWA();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">SpotMap</span>
          </div>
        </div>

        {/* Center - Search */}
        {showSearch && (
          <div className={cn(
            "flex-1 max-w-md mx-4 transition-all duration-200",
            isSearchExpanded ? "max-w-full" : ""
          )}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search spots, events, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setIsSearchExpanded(false)}
                className="pl-10 pr-4"
              />
            </form>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Install PWA Button */}
          {isInstallable && (
            <Button
              variant="outline"
              size="sm"
              onClick={installApp}
              className="hidden sm:flex"
            >
              Install App
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

## Development Phases & Implementation Timeline

### Phase 1 (Weeks 1-2): Foundation Setup
**Database & Authentication**
- ✅ Extend database schema with PostGIS support
- ✅ Set up geospatial indexes and constraints
- ✅ Implement role-based authentication extensions
- ✅ Create basic API endpoints with validation
- ✅ Set up audit logging and security measures

**Core UI Components**
- ✅ Extend shadcn/ui with custom components
- ✅ Create mobile-responsive layout system
- ✅ Implement bottom navigation for mobile
- ✅ Set up error boundaries and loading states

### Phase 2 (Weeks 3-4): Map Integration & Core Features
**Google Maps Implementation**
- ✅ Integrate Google Maps with Advanced Markers
- ✅ Implement marker clustering with supercluster
- ✅ Add drawing tools for routes
- ✅ Create location selection interface
- ✅ Implement geospatial search and filtering

**Spot Management**
- ✅ Create spot submission form with validation
- ✅ Implement photo upload to Cloudflare R2
- ✅ Build spot details view with reviews
- ✅ Add filtering and search functionality

### Phase 3 (Weeks 5-6): Content Management & Moderation
**Advanced Moderation System**
- ✅ Implement automated content analysis
- ✅ Create moderation queue with priority system
- ✅ Build moderator dashboard interface
- ✅ Add community reporting functionality
- ✅ Set up audit logging and admin tools

**User Collections & Social Features**
- ✅ Implement user collections/favorites system
- ✅ Create shareable collections interface
- ✅ Add user activity tracking
- ✅ Build achievement/badge system

### Phase 4 (Weeks 7-8): Events & Advanced Features
**Events System**
- ✅ Create event management with RSVP
- ✅ Implement recurring events for moderators
- ✅ Add event calendar integration
- ✅ Build participant management system
- ✅ Integrate weather data for events

**Advanced Search & Discovery**
- ✅ Implement full-text search with PostgreSQL
- ✅ Add trending/popular spots algorithm
- ✅ Create route-based spot discovery
- ✅ Build recommendation system

### Phase 5 (Weeks 9-10): PWA & Performance
**Progressive Web App**
- ✅ Implement Serwist service worker
- ✅ Add offline functionality with IndexedDB
- ✅ Create installable app manifest
- ✅ Implement background sync for offline actions
- ✅ Add push notifications system

**Performance Optimization**
- ✅ Optimize database queries with proper indexing
- ✅ Implement image optimization and CDN
- ✅ Add caching strategies for API responses
- ✅ Optimize bundle size and loading performance

### Phase 6 (Weeks 11-12): Testing, Polish & Launch
**Quality Assurance**
- ✅ End-to-end testing with Playwright
- ✅ Performance testing and optimization
- ✅ Security audit and penetration testing
- ✅ Accessibility testing and improvements
- ✅ Cross-browser and device testing

**Production Deployment**
- ✅ Set up production environment on Vercel
- ✅ Configure database backups and monitoring
- ✅ Implement error tracking with Sentry
- ✅ Set up analytics and performance monitoring
- ✅ Create documentation and user guides

## Environment Variables & Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="your-32-character-secret-here"
NEXT_PUBLIC_APP_URL="https://spotmap.app"

# OAuth (optional for development)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Maps & Places
GOOGLE_PLACES_API_KEY="your-google-places-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID="your-map-id"

# Subscription Management (if using Polar.sh)
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
NEXT_PUBLIC_STARTER_TIER="your-product-tier-id"
NEXT_PUBLIC_STARTER_SLUG="your-product-slug"

# Image Storage (Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
R2_UPLOAD_IMAGE_ACCESS_KEY_ID="your-r2-access-key"
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_UPLOAD_IMAGE_BUCKET_NAME="spotmap-images"

# Optional: Weather API
OPENWEATHER_API_KEY="your-openweather-api-key"

# Optional: Push Notifications
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

## Cost Optimization Strategies

### Google Maps API Cost Management
1. **Use session-based pricing** for Places Autocomplete (currently free)
2. **Implement field masks** to request only necessary data
3. **Cache map tiles** and API responses appropriately
4. **Use clustering** to reduce marker API calls
5. **Implement smart prefetching** during user interactions

### Database Optimization
1. **Proper indexing** for geospatial and search queries
2. **Connection pooling** with Neon PostgreSQL
3. **Query optimization** with Drizzle ORM prepared statements
4. **Implement caching** for frequently accessed data

### Storage & CDN
1. **Cloudflare R2** for cost-effective image storage
2. **Image optimization** with Next.js Image component
3. **Smart caching** strategies for static assets

This comprehensive plan provides a production-ready foundation for building the SpotMap longboarding application, leveraging modern web technologies and best practices for performance, security, and user experience.
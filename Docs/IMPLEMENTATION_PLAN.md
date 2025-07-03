# SpotMap Longboarding App Implementation Plan

## Architecture Overview

Building on the existing Next.js starter kit with:

- **Database**: Extend current Drizzle schema with longboarding-specific tables
- **Authentication**: Leverage existing Better Auth system with role-based permissions
- **Maps**: Build on existing Google Places API integration + add Google Maps JavaScript API
- **UI**: Extend current shadcn/ui components with longboarding-specific components
- **PWA**: Add service worker and manifest for mobile-first experience

## Phase 1: Database Schema & Core Models

### New Database Tables

#### User Table Extension
```sql
-- Extend user table with role field
ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'moderator', 'admin'));
```

#### Core Tables

**Spots Table**
```sql
spots (
  id, user_id, name, description, 
  location_lat, location_lng, visibility, 
  spot_type, difficulty, start_lat, start_lng, 
  end_lat, end_lng, best_times, safety_notes, 
  rules, photos, status, created_at, updated_at
)
```

**Events Table**
```sql
events (
  id, spot_id, user_id, title, description, 
  start_time, end_time, is_recurring, 
  recurrence_data, created_at
)
```

**Collections Table**
```sql
collections (
  id, user_id, name, spot_ids, 
  is_public, created_at
)
```

**Moderation Queue**
```sql
moderation_queue (
  id, content_type, content_id, status, 
  moderator_id, reviewed_at, feedback
)
```

### API Endpoints

- `/api/spots` - CRUD operations for spots
- `/api/events` - Event management
- `/api/collections` - User collections/favorites
- `/api/moderation` - Moderation queue management
- `/api/maps` - Google Maps integration helpers

## Phase 2: Core Components & Map Integration

### Map Components

- **MapView** - Google Maps wrapper with spot markers
- **SpotMarker** - Custom marker for longboarding spots
- **SpotCreationModal** - Long-press to create spot functionality
- **RouteDrawer** - Draw routes between start/end points

### Spot Management Components

- **SpotCard** - Display spot information
- **SpotForm** - Create/edit spot form
- **SpotFilters** - Filter by type, difficulty, visibility
- **SpotDetails** - Detailed spot view with photos

### User Interface Components

- **NavigationTabs** - Bottom navigation for mobile
- **UserProfile** - Profile with created spots and collections
- **ModerationPanel** - Admin/moderator content review
- **EventCard** - Event information display

## Phase 3: Progressive Web App Features

### PWA Implementation

- Service worker for offline functionality
- App manifest for installability
- Offline spot caching
- GPS integration for location services
- Touch-optimized interactions

### Mobile Optimizations

- Bottom sheet modals for mobile
- Swipe gestures for navigation
- Location-based push notifications
- Offline map tiles caching

## Phase 4: Advanced Features

### Content Moderation System

- Auto-moderation with rate limiting
- Queue system for public spots
- Community reporting functionality
- Simple approve/reject workflow

### Events & Social Features

- Event creation and management
- Recurring events for moderators
- Join/leave event functionality
- Event calendar integration

## Implementation Strategy

### Leveraging Existing Architecture

1. **User Management**: Extend current user table with role field
2. **Authentication**: Use existing Better Auth with role-based middleware
3. **Database**: Extend current Drizzle schema and migrations
4. **API Patterns**: Follow existing validation and error handling
5. **UI Components**: Build on existing shadcn/ui component library
6. **Google Integration**: Extend current Places API with Maps JavaScript API

### Development Workflow

1. **Database First**: Create schema and migrations
2. **API Development**: Build REST endpoints following existing patterns
3. **Component Development**: Create reusable UI components
4. **Map Integration**: Implement Google Maps with custom markers
5. **PWA Features**: Add offline capabilities and installability
6. **Testing & Polish**: Ensure mobile responsiveness and performance

## Environment Variables Required

```env
# Existing variables remain the same
GOOGLE_MAPS_API_KEY="your-maps-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-public-maps-api-key"
```

## Cost Optimization

- Optimize Google Maps API calls with clustering
- Implement efficient spot caching
- Use existing Cloudflare R2 for photo storage
- Leverage existing Neon PostgreSQL setup

## Summary

This plan builds incrementally on your existing architecture while adding the longboarding-specific functionality. The existing authentication, database patterns, and UI components provide a solid foundation to build upon.

The phased approach ensures manageable development cycles while maintaining the high-quality standards established in the current codebase.
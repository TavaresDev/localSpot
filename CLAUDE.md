# Next.js SaaS Starter Kit - Architecture Documentation

## Package Manager
Use `yarn` instead of `npm` for all package management tasks.

## Development Commands
- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Build project: `yarn build`
- Run linting: `yarn lint`
- Database migrations: `yarn drizzle-kit generate && yarn drizzle-kit push`
- .env is acctualy .env.local

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth v1.2.8
- **Payments**: Polar.sh integration
- **Storage**: Cloudflare R2
- **AI**: OpenAI integration
- **Analytics**: PostHog + Vercel Analytics

### Project Structure
```
app/                    # Next.js App Router
├── (app)/             # Route group - Mobile app pages
│   ├── layout.tsx     # Mobile-focused layout (bottom nav, FAB)
│   ├── map/           # → /map (mobile map view)
│   └── spots/         # → /spots (mobile spots listing)
├── api/               # API routes
├── dashboard/         # Protected dashboard area (desktop)
│   ├── layout.tsx     # Desktop layout (sidebar, top nav)
│   ├── spots/         # → /dashboard/spots (admin spots)
│   └── settings/      # → /dashboard/settings
├── (auth)/           # Authentication pages
└── globals.css       # Global styles

components/
├── ui/               # shadcn/ui base components
├── homepage/         # Landing page components
├── navigation/       # Mobile navigation components
└── error-boundary.tsx # Error handling

lib/
├── auth.ts           # Better Auth configuration
├── auth-client.ts    # Client-side auth
├── api-error.ts      # Standardized error handling
├── subscription.ts   # Subscription utilities
├── types/            # Type definitions
│   └── spots.ts      # Centralized spot types & constants
└── utils.ts          # Utility functions

db/
├── schema.ts         # Database schema
├── drizzle.ts        # Database connection
└── migrations/       # Database migrations
```

## 🔒 Authentication System

### Better Auth Implementation
- **Session-based authentication** with database persistence
- **Google OAuth** integration
- **Middleware route protection**
- **Polar.sh customer integration**

### Database Schema
```sql
user (1) -> (N) sessions (cascade delete)
user (1) -> (N) accounts (cascade delete)
user (1) -> (0..1) subscription
```

### Key Features
- Automatic session management
- Social provider integration
- Subscription lifecycle tracking
- Webhook handling for real-time updates

## 💳 Payment & Subscription System

### Polar.sh Integration
- **Subscription management** with webhook handling
- **Customer portal** for self-service billing
- **Product catalog** with pricing tiers
- **Usage tracking** and analytics

### Subscription Lifecycle
1. User signs up → Customer created in Polar.sh
2. User subscribes → Webhook updates database
3. Status changes → Real-time sync via webhooks
4. Cancellation → Graceful handling with end dates

## 🗄️ Database Architecture

### Drizzle ORM + Neon PostgreSQL
- **Type-safe queries** with full TypeScript support
- **Schema migrations** with drizzle-kit
- **Connection pooling** via Neon
- **Serverless-ready** architecture

### Core Tables
- `user`: User profiles and metadata
- `session`: Authentication sessions
- `account`: OAuth account linking
- `subscription`: Payment and subscription data
- `verification`: Email verification tokens

### SpotMap Application Tables
- `spots`: Longboarding spot locations and metadata
- `events`: Time-based activities at spots
- `collections`: User-curated spot lists (favorites)
- `moderationQueue`: Content approval workflow

## 🛣️ Routing Architecture & Route Groups

### Next.js Route Groups Pattern
This application uses **route groups** `()` to organize pages without affecting URL structure:

```
app/(app)/map/page.tsx        → /map (NOT /(app)/map)
app/(app)/spots/page.tsx      → /spots (NOT /(app)/spots)
app/dashboard/spots/page.tsx  → /dashboard/spots
```

### Dual Interface Architecture

#### Mobile/Public App (`app/(app)/`)
- **Target**: End users browsing and discovering spots
- **Layout**: Mobile-first with bottom navigation and floating action button
- **Pages**: `/map`, `/spots`, `/spots/create`
- **Features**: 
  - Touch-optimized interface
  - GPS-based spot discovery
  - Quick spot creation workflow

#### Desktop Admin (`app/dashboard/`)
- **Target**: Content moderators and power users
- **Layout**: Desktop sidebar with comprehensive navigation
- **Pages**: `/dashboard`, `/dashboard/spots`, `/dashboard/settings`
- **Features**:
  - Comprehensive spot management
  - Moderation workflows
  - Analytics and reporting

### Route Resolution Priority
Next.js resolves routes in this order:
1. **Exact file matches** (highest priority)
2. **Dynamic routes** `[id]`
3. **Catch-all routes** `[...slug]`
4. **Route groups ignored** in URL matching

### API Architecture

#### RESTful API Design
```
Collection Operations:
GET  /api/spots       # List/search spots with filtering
POST /api/spots       # Create new spot

Individual Operations:
GET    /api/spots/[id] # Get specific spot
PUT    /api/spots/[id] # Update specific spot
DELETE /api/spots/[id] # Delete specific spot
```

#### Type-Safe API Patterns
- **Zod validation** for all inputs using centralized type constants
- **Drizzle ORM** with single-query-chain pattern (avoid multiple .where() calls)
- **Standardized error handling** with withErrorHandling wrapper
- **Authentication middleware** with validateSession()

#### Centralized Type System
All domain types are defined in `lib/types/spots.ts`:
```typescript
// Constants for validation
export const SPOT_TYPES = ["downhill", "freeride", "freestyle", "cruising", "dancing", "pumping"] as const;
export const SPOT_DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"] as const;

// Inferred types from database schema
export type Spot = typeof spots.$inferSelect;
export type NewSpot = typeof spots.$inferInsert;

// API validation schemas use constants
spotType: z.enum(SPOT_TYPES),  // Single source of truth
```

### Database Integration

#### Drizzle ORM Best Practices
```typescript
// ✅ Correct: Build conditions first, apply once
const conditions = [];
conditions.push(eq(spots.visibility, "public"));
conditions.push(eq(spots.status, "approved"));

const query = db
  .select()
  .from(spots)
  .leftJoin(user, eq(spots.userId, user.id))
  .where(and(...conditions))  // Single .where() call
  .orderBy(desc(spots.createdAt))
  .limit(20);

// ❌ Wrong: Multiple .where() calls break type system
query = query.where(condition1);
query = query.where(condition2);  // Error: .where() no longer exists
```

## 🎨 UI/UX Architecture

### Design System
- **shadcn/ui components** for accessibility
- **Tailwind CSS** with custom design tokens
- **Dark mode support** via next-themes
- **Responsive design** with mobile-first approach

### Component Patterns
- **Server Components** for data fetching
- **Client Components** for interactivity
- **Error Boundaries** for graceful error handling
- **Loading states** and skeleton components

## 🛡️ Security & Error Handling

### Security Measures
- **Session-based authentication** (more secure than JWT-only)
- **File upload validation** (MIME type, size limits)
- **Environment variable validation**
- **Webhook signature verification**
- **Route protection via middleware**

### Error Handling
- **React Error Boundaries** for UI error recovery
- **Standardized API errors** with proper HTTP status codes
- **Development vs Production** error disclosure
- **Comprehensive logging** for debugging

## 🚀 Performance Optimizations

### Next.js Features
- **App Router** for better performance
- **Server Components** for reduced bundle size
- **Image optimization** with next/image
- **Font optimization** with next/font

### Caching Strategy
- **Better Auth cookie caching** (5-minute cache)
- **Static page generation** where appropriate
- **Database connection pooling**

## 🔧 Development Workflow

### Environment Setup
1. **Clone repository**
2. **Install dependencies**: `yarn install`
3. **Set up environment variables** in `.env.local`
4. **Create Neon database** and update `DATABASE_URL`
5. **Run migrations**: `yarn drizzle-kit push`
6. **Start development**: `yarn dev`

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host/db"

# Authentication
BETTER_AUTH_SECRET="32-character-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# OAuth (optional for development)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Polar.sh (required for subscriptions)
POLAR_ACCESS_TOKEN=""
POLAR_WEBHOOK_SECRET=""
NEXT_PUBLIC_STARTER_TIER=""
NEXT_PUBLIC_STARTER_SLUG=""

# OpenAI (optional)
OPENAI_API_KEY=""

# Google Places API (required for business search)
GOOGLE_PLACES_API_KEY=""

# Cloudflare R2 (optional)
CLOUDFLARE_ACCOUNT_ID=""
R2_UPLOAD_IMAGE_ACCESS_KEY_ID=""
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY=""
R2_UPLOAD_IMAGE_BUCKET_NAME=""
```

## 📝 Code Quality Standards

### TypeScript Configuration
- **Strict mode enabled** for maximum type safety
- **Build error checking enabled** (no bypass)
- **Proper type definitions** for all major functions

### Component Standards
- **Error boundaries** for all major UI sections
- **Loading states** for async operations
- **Proper prop validation** with TypeScript
- **Consistent naming conventions**

### API Standards
- **Standardized error responses** with proper HTTP status codes
- **Input validation** for all endpoints
- **Error logging** for debugging
- **Security headers** and CORS handling

## 🚨 Critical Production Checklist

### Security
- [ ] Review all environment variables
- [ ] Enable proper CORS settings
- [ ] Set up rate limiting
- [ ] Review file upload restrictions
- [ ] Audit webhook security

### Performance
- [ ] Enable caching strategies
- [ ] Optimize images and fonts
- [ ] Review bundle size
- [ ] Set up monitoring

### Reliability
- [ ] Add comprehensive error logging
- [ ] Set up health checks
- [ ] Configure backup strategies
- [ ] Test disaster recovery

## 🔍 Monitoring & Analytics

### Built-in Analytics
- **Vercel Analytics** for performance metrics
- **PostHog** for user behavior tracking
- **Console logging** for development debugging

### Recommended Additions
- **Sentry** for error tracking
- **Uptime monitoring** for availability
- **Database monitoring** for performance
- **Custom metrics** for business KPIs

## 🎯 Best Practices

### Development
1. Always use TypeScript strict mode
2. Implement error boundaries for UI components
3. Use server components by default, client only when needed
4. Follow Next.js App Router patterns
5. Validate all user inputs

### Production
1. Never disable TypeScript checking
2. Use environment variables for all secrets
3. Implement proper error logging
4. Set up monitoring and alerting
5. Regular security audits

This architecture provides a solid foundation for building scalable SaaS applications with modern best practices and production-ready patterns.

## 📚 Additional Documentation

### Architecture Decision Records
See [Docs/ARCHITECTURE_DECISIONS.md](./Docs/ARCHITECTURE_DECISIONS.md) for detailed architectural decisions including:
- **ADR-001**: Dual Interface Architecture (Mobile vs Desktop)
- **ADR-002**: Route Groups for URL Organization  
- **ADR-003**: Centralized Type System
- **ADR-004**: Hook Organization Architecture
- **ADR-005**: TanStack Query Implementation for Data Layer

### TanStack Query Data Architecture
See [Docs/TANSTACK_QUERY_ARCHITECTURE.md](./Docs/TANSTACK_QUERY_ARCHITECTURE.md) for comprehensive TanStack Query implementation details including:
- **Three-layer architecture**: Pages → Query Hooks → Services
- **Performance optimizations**: Debouncing, caching strategies, memory management
- **Migration benefits**: 200+ lines of boilerplate removed, automatic error handling
- **Best practices**: When to use/not use, cache key design, type safety

### Implementation Planning
See [Docs/IMPLEMENTATION_PLAN.md](./Docs/IMPLEMENTATION_PLAN.md) for the complete SpotMap longboarding app development roadmap, including:
- **Phase-by-phase development strategy**
- **Database schema design**
- **Component architecture**
- **PWA implementation plan**

### Database & Authentication Architecture
See [Docs/DATABASE_AUTH_ARCHITECTURE.md](./Docs/DATABASE_AUTH_ARCHITECTURE.md) for detailed database and authentication system design.

These documents capture the reasoning behind major architectural choices, alternatives considered, and implementation strategies.

## Memories
- Save this architecture decisions and types to Claude for future reference
- Explanation of how the API and DB work for spots: The backend uses Drizzle ORM with Neon PostgreSQL to manage spot data. Each spot is stored in a database table with fields like ID, name, location, description, etc. The API routes in Next.js handle CRUD operations by interacting with the database schema defined in `db/schema.ts`. When a user creates, updates, or retrieves a spot, the API uses type-safe Drizzle queries to interact with the database, ensuring data integrity and providing a robust, scalable backend for managing location spots.
- **Dual Interface Strategy**: Mobile app (`app/(app)/`) for public spot discovery with touch-optimized UI, Desktop dashboard (`app/dashboard/`) for admin/moderation. Shared business logic via hooks (`useSpotForm`, `useSpots`) and services (`spotService`) to avoid duplication while optimizing UX per platform. Mobile-first marketing strategy with dashboard as hidden power-user tool.
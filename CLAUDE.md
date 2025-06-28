# Next.js SaaS Starter Kit - Architecture Documentation

## Package Manager
Use `yarn` instead of `npm` for all package management tasks.

## Development Commands
- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Build project: `yarn build`
- Run linting: `yarn lint`
- Database migrations: `yarn drizzle-kit generate && yarn drizzle-kit push`

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
├── api/               # API routes
├── dashboard/         # Protected dashboard area
├── (auth)/           # Authentication pages
└── globals.css       # Global styles

components/
├── ui/               # shadcn/ui base components
├── homepage/         # Landing page components
└── error-boundary.tsx # Error handling

lib/
├── auth.ts           # Better Auth configuration
├── auth-client.ts    # Client-side auth
├── api-error.ts      # Standardized error handling
├── subscription.ts   # Subscription utilities
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
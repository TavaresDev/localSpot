# 🔐 Database & Authentication Architecture Guide
## Complete Analysis of Next.js SaaS Starter Kit

> **Target Audience**: Junior developers and teams looking to understand or replicate this authentication and database architecture.

---

## 🎯 Executive Summary

This Next.js SaaS starter kit implements a **production-ready authentication system** using:
- **Better Auth v1.2.8** (session-based authentication)
- **Drizzle ORM v0.43.1** (type-safe database operations)
- **Neon PostgreSQL** (serverless database)
- **Polar.sh** (subscription management)

**Key Achievement**: A complete auth system in ~200 lines of configuration code with enterprise-level features.

---

## 🏗️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│  Better Auth    │────│ Neon PostgreSQL │
│   (Frontend)    │    │  (Auth Engine)  │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │──────────────│  Drizzle ORM    │──────────────│
         │              │ (Type Safety)   │              │
         │              └─────────────────┘              │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐              │
│  Polar.sh       │────│   Webhooks      │──────────────│
│ (Payments)      │    │  (Real-time)    │              
└─────────────────┘    └─────────────────┘              
```

---

## 📁 File Structure & Responsibilities

### Core Database Files
```
db/
├── schema.ts          # 🗂️  Database table definitions (86 lines)
├── drizzle.ts         # 🔌  Database connection (6 lines!)
└── migrations/        # 📋  Auto-generated SQL migrations
    ├── 0000_worried_rawhide_kid.sql
    └── meta/
        ├── 0000_snapshot.json
        └── _journal.json

drizzle.config.ts      # ⚙️  Migration configuration (13 lines)
```

### Core Authentication Files
```
lib/
├── auth.ts            # 🔐  Better Auth configuration (192 lines)
├── auth-client.ts     # 👤  Client-side auth utilities (11 lines)
└── subscription.ts    # 💳  Subscription business logic (148 lines)

app/api/auth/
└── [...all]/
    └── route.ts       # 🛣️  Auth API endpoints (4 lines!)

middleware.ts          # 🛡️  Route protection (45 lines)
```

### Authentication Pages
```
app/
├── sign-in/page.tsx   # 📝  Login page with Google OAuth
├── sign-up/page.tsx   # ✍️  Registration page
└── dashboard/         # 🏠  Protected area
    ├── layout.tsx     # 🔒  Protected layout
    └── page.tsx       # 📊  Dashboard content
```

---

## 🗃️ Database Schema Deep Dive

### Table Structure & Relationships

```sql
-- Core User Management
user (1) ──→ (N) sessions     [CASCADE DELETE]
user (1) ──→ (N) accounts     [CASCADE DELETE]  
user (1) ──→ (0..1) subscription [SOFT REFERENCE]

-- Supporting Tables
verification (standalone)      -- Email verification tokens
```

### Detailed Schema Analysis

#### 1. **User Table** (`user`)
```typescript
export const user = pgTable("user", {
  id: text("id").primaryKey(),                    // UUID primary key
  name: text("name").notNull(),                   // Full name
  email: text("email").notNull().unique(),        // Unique email
  emailVerified: boolean("emailVerified").default(false), // Verification status
  image: text("image"),                           // Profile picture URL
  createdAt: timestamp("createdAt").defaultNow(), // Account creation
  updatedAt: timestamp("updatedAt").defaultNow(), // Last update
});
```

**Purpose**: Core user profile storage with email verification support.

#### 2. **Session Table** (`session`)
```typescript
export const session = pgTable("session", {
  id: text("id").primaryKey(),                    // Session UUID
  expiresAt: timestamp("expiresAt").notNull(),    // Expiration time
  token: text("token").notNull().unique(),        // Session token
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  ipAddress: text("ipAddress"),                   // Security tracking
  userAgent: text("userAgent"),                   // Device tracking
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
});
```

**Purpose**: Session-based authentication with security tracking and automatic cleanup.

#### 3. **Account Table** (`account`)
```typescript
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),         // Provider account ID
  providerId: text("providerId").notNull(),       // OAuth provider
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),               // OAuth tokens
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),                          // OAuth scopes
  password: text("password"),                    // For password auth
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
```

**Purpose**: OAuth provider account linking with token management.

#### 4. **Subscription Table** (`subscription`)
```typescript
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),                    // Polar.sh subscription ID
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),            // Price in cents
  currency: text("currency").notNull(),           // USD, EUR, etc.
  recurringInterval: text("recurringInterval").notNull(), // monthly, yearly
  status: text("status").notNull(),               // active, canceled, etc.
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  // ... more Polar.sh specific fields
  userId: text("userId").references(() => user.id),
});
```

**Purpose**: Complete subscription lifecycle management with Polar.sh integration.

---

## 🔐 Authentication Flow Analysis

### 1. Sign-In Process (Step-by-Step)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant BA as Better Auth
    participant G as Google OAuth
    participant DB as Database

    U->>C: Click "Sign in with Google"
    C->>BA: authClient.signIn.social()
    BA->>G: Redirect to Google OAuth
    G->>U: Show consent screen
    U->>G: Grant permission
    G->>BA: Return with auth code
    BA->>G: Exchange code for tokens
    G->>BA: Return user data & tokens
    BA->>DB: Create/update user record
    BA->>DB: Create session record
    BA->>C: Set HTTP-only cookie
    C->>U: Redirect to dashboard
```

### 2. Session Validation Process

```typescript
// Server-side validation (in dashboard pages)
export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### 3. Client-side Authentication Hook

```typescript
// In UserProfile component
"use client";
import { authClient } from "@/lib/auth-client";

export function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession()
      .then(result => {
        if (result.data?.user) {
          setUser(result.data.user);
        } else {
          router.push("/sign-in");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>Hello, {user?.name}</div>;
}
```

---

## 🛡️ Security Implementation

### 1. Route Protection Strategy

```typescript
// middleware.ts - Edge-level protection
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Strategy 1: Bypass webhooks (external services)
  if (pathname.startsWith("/api/payments/webhooks")) {
    return NextResponse.next();
  }

  // Strategy 2: Redirect authenticated users from auth pages
  if (sessionCookie && ["/sign-in", "/sign-up"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Strategy 3: Protect dashboard routes
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
```

### 2. Session Security Features

- **HTTP-only cookies**: Prevent XSS token theft
- **5-minute caching**: Balance performance vs. security
- **IP & User Agent tracking**: Detect suspicious activity
- **Automatic expiration**: Sessions auto-cleanup
- **Database-backed**: Server-side validation always

### 3. Error Handling Security

```typescript
// lib/api-error.ts - Production-safe error responses
export class APIException extends Error {
  toResponse() {
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return Response.json(
      {
        error: this.code,
        message: this.message,
        // Only include details in development
        ...(isDevelopment && { 
          details: this.details,
          stack: this.stack 
        }),
      },
      { status: this.statusCode }
    );
  }
}
```

---

## 💳 Subscription Integration Deep Dive

### 1. Polar.sh Webhook Processing

```javascript
// lib/auth.ts - Real-time subscription sync
webhooks({
  secret: process.env.POLAR_WEBHOOK_SECRET,
  onPayload: async ({ data, type }) => {
    if (type === "subscription.created" || type === "subscription.active") {
      const subscriptionData = {
        id: data.id,
        createdAt: new Date(data.createdAt),
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        userId: data.customer?.externalId, // Link to our user
        // ... more fields
      };

      // Upsert pattern for idempotent webhooks
      await db.insert(subscription)
        .values(subscriptionData)
        .onConflictDoUpdate({
          target: subscription.id,
          set: subscriptionData
        });
    }
  }
});
```

### 2. Subscription Utilities

```typescript
// lib/subscription.ts - Business logic helpers
export async function isUserSubscribed(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;

  const userSub = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .limit(1);

  return userSub[0]?.status === "active";
}

export async function hasAccessToProduct(productId: string): Promise<boolean> {
  const result = await getSubscriptionDetails();
  return result.subscription?.productId === productId && 
         result.subscription?.status === "active";
}
```

---

## 🚀 Setup Guide for New Projects

### Step 1: Database Setup
```bash
# 1. Create Neon database
# Visit https://neon.tech and create new project

# 2. Get connection string
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### Step 2: Install Dependencies
```bash
yarn add better-auth drizzle-orm @neondatabase/serverless
yarn add @polar-sh/better-auth @polar-sh/sdk
yarn add -D drizzle-kit
```

### Step 3: Environment Configuration
```env
# Database
DATABASE_URL="your-neon-connection-string"

# Authentication
BETTER_AUTH_SECRET="your-32-character-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Polar.sh
POLAR_ACCESS_TOKEN="your-polar-token"
POLAR_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_STARTER_TIER="your-product-id"
NEXT_PUBLIC_STARTER_SLUG="your-product-slug"
```

### Step 4: Schema & Migration
```bash
# Generate migration
yarn drizzle-kit generate

# Apply to database
yarn drizzle-kit push
```

### Step 5: Authentication Setup
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification }
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

---

## 🏦 Banking Use Case Adaptation

### Extended Schema for Banking (example)

```typescript
// Add to db/schema.ts
export const bankAccount = pgTable("bank_account", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  
  // Encrypted sensitive data
  accountNumberEncrypted: text("account_number_encrypted").notNull(),
  routingNumber: text("routing_number").notNull(),
  
  // Metadata
  accountType: text("account_type").notNull(), // checking, savings, credit
  bankName: text("bank_name").notNull(),
  accountNickname: text("account_nickname"),
  
  // Verification & Security
  isVerified: boolean("is_verified").default(false),
  verificationMethod: text("verification_method"), // micro_deposits, instant
  lastVerificationAt: timestamp("last_verification_at"),
  
  // Status & Timestamps
  status: text("status").default("pending"), // pending, active, suspended
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  bankAccountId: text("bank_account_id").references(() => bankAccount.id),
  
  // Transaction Data
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  description: text("description").notNull(),
  category: text("category"), // food, transport, etc.
  
  // Transaction Metadata
  transactionDate: timestamp("transaction_date").notNull(),
  postingDate: timestamp("posting_date"),
  type: text("type").notNull(), // debit, credit, transfer
  status: text("status").default("completed"), // pending, completed, failed
  
  // External Reference
  externalTransactionId: text("external_transaction_id"),
  merchantName: text("merchant_name"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Goals/Budgets
export const budget = pgTable("budget", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: integer("amount").notNull(), // in cents
  period: text("period").notNull(), // monthly, weekly, yearly
  
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Security Enhancements for Banking

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.BANK_DATA_ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

export function encryptBankAccount(accountNumber: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(iv);
  
  let encrypted = cipher.update(accountNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptBankAccount(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Banking API Implementation {example}

```typescript
// app/api/bank-accounts/route.ts
import { auth } from "@/lib/auth";
import { APIException } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) {
      throw APIException.unauthorized();
    }

    const { accountNumber, routingNumber, bankName, accountType } = await request.json();

    // Validate bank account (integrate with Plaid, Yodlee, etc.)
    const isValid = await validateBankAccount(accountNumber, routingNumber);
    if (!isValid) {
      throw APIException.badRequest("Invalid bank account details");
    }

    // Encrypt sensitive data
    const encryptedAccountNumber = encryptBankAccount(accountNumber);

    const bankAccount = await db.insert(bankAccount).values({
      id: nanoid(),
      userId: session.user.id,
      accountNumberEncrypted: encryptedAccountNumber,
      routingNumber,
      bankName,
      accountType,
      status: "pending",
    }).returning();

    // Start verification process (micro deposits, etc.)
    await initiateBankAccountVerification(bankAccount[0].id);

    return Response.json({ 
      success: true, 
      bankAccount: {
        id: bankAccount[0].id,
        bankName: bankAccount[0].bankName,
        accountType: bankAccount[0].accountType,
        status: bankAccount[0].status,
        // Never return encrypted account number
      }
    });

  } catch (error) {
    if (error instanceof APIException) {
      return error.toResponse();
    }
    console.error("Bank account creation error:", error);
    return APIException.internal().toResponse();
  }
}
```

---

## 📊 Performance Optimizations

### 1. Database Query Patterns

```typescript
// Efficient subscription check with join
export async function getUserWithSubscription(userId: string) {
  return await db
    .select({
      user: user,
      subscription: subscription,
    })
    .from(user)
    .leftJoin(subscription, eq(user.id, subscription.userId))
    .where(eq(user.id, userId))
    .limit(1);
}

// Paginated transaction history
export async function getTransactionHistory(userId: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  
  return await db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.transactionDate))
    .limit(limit)
    .offset(offset);
}
```

### 2. Caching Strategy (Progressive Approach)

```typescript
// Stage 1: Next.js built-in caching (CURRENT APPROACH)
import { cache } from 'react';

export const getUserSubscription = cache(async (userId: string) => {
  // Automatically cached per request in Next.js
  return await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
});

// Stage 2: Simple in-memory cache (when needed)
const subscriptionCache = new Map<string, { data: any; expires: number }>();

export async function getCachedSubscription(userId: string) {
  const cached = subscriptionCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = await getUserSubscription(userId);
  subscriptionCache.set(userId, { 
    data, 
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  return data;
}


```

> **💡 Starter Kit Recommendation**: Begin with Next.js built-in caching (Stage 1). The current project uses Better Auth's 5-minute cookie cache, which is perfect for most starter use cases. Only add Redis when you have multiple server instances or very high traffic.

---

## 🔧 Monitoring & Debugging

### 1. Logging Strategy (Serverless-Optimized)

```typescript
// lib/logger.ts - Lightweight serverless logging
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ 
      level: 'info', 
      message, 
      timestamp: new Date().toISOString(),
      ...meta 
    }));
  },
  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta 
    }));
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ 
      level: 'warn', 
      message, 
      timestamp: new Date().toISOString(),
      ...meta 
    }));
  }
};

// Usage in auth.ts
logger.info('User signed in', { 
  userId: session.user.id, 
  email: session.user.email,
  provider: 'google'
});
```

> **💡 Serverless Note**: In serverless environments (Vercel, Netlify, AWS Lambda), `console.log` is automatically captured by the platform's logging service. This lightweight wrapper provides structured JSON logging without the bundle size overhead of Winston (~500KB).

### 2. Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    await db.select().from(user).limit(1);
    
    // Test auth system
    const healthSession = await auth.api.getSession({ 
      headers: new Headers() 
    });
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        auth: 'operational',
      }
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

---

## 🎯 Complexity Progression Guide

### **Phase 1: MVP (Current Implementation)**
Perfect for starter projects, small teams, and initial development:

- ✅ **Logging**: `console.log` with JSON structure (captured by Vercel/Netlify)
- ✅ **Caching**: Better Auth 5-minute cookie cache + Next.js built-in caching
- ✅ **Error Handling**: Simple APIException pattern
- ✅ **Database**: Neon serverless with Drizzle connection pooling
- ✅ **Authentication**: Session-based with Better Auth

**Bundle Size**: ~2.5MB (optimized)  
**Infrastructure**: Database + Next.js hosting only  
**Monthly Cost**: $0-25 (Hobby tier)



---

## ✅ Production Checklist

### Security
- [ ] Enable row-level security in PostgreSQL
- [ ] Set up proper CORS headers
- [ ] Implement rate limiting on auth endpoints
- [ ] Configure CSP headers
- [ ] Set up webhook signature verification
- [ ] Enable database connection SSL
- [ ] Implement audit logging for sensitive operations

### Performance
- [ ] Set up Redis for session caching
- [ ] Enable database connection pooling
- [ ] Implement query result caching
- [ ] Set up CDN for static assets
- [ ] Configure proper database indexes
- [ ] Enable gzip compression

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Implement custom metrics tracking
- [ ] Set up log aggregation
- [ ] Configure alerting for critical errors
- [ ] Set up database performance monitoring

### Backup & Recovery
- [ ] Configure automated database backups
- [ ] Test backup restoration process
- [ ] Set up cross-region backup replication
- [ ] Document disaster recovery procedures
- [ ] Test failover scenarios

---

## 🏆 Key Strengths of This Architecture

### 1. **Simplicity with Power**
- **6-line database connection** (`db/drizzle.ts`)
- **4-line API handler** (`app/api/auth/[...all]/route.ts`)
- **Complete auth system** in ~200 lines of config

### 2. **Type Safety Throughout**
- **Database schema** generates TypeScript types
- **Authentication** fully typed with Better Auth
- **API responses** typed with custom exceptions
- **Frontend components** use inferred types

### 3. **Production-Ready Security**
- **Session-based authentication** (more secure than JWT-only)
- **HTTP-only cookies** prevent XSS attacks
- **Automatic session cleanup** prevents memory leaks
- **Comprehensive error handling** prevents information leakage

### 4. **Real-Time Integration**
- **Webhook processing** for subscription updates
- **Idempotent operations** handle duplicate webhooks
- **Database transactions** ensure data consistency

### 5. **Developer Experience**
- **Automatic migrations** with Drizzle Kit
- **Hot reload** in development
- **Clear error messages** with stack traces
- **Comprehensive TypeScript** support

---

## 📚 Additional Resources

### Documentation Links
- [Better Auth Documentation](https://better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Database Documentation](https://neon.tech/docs)
- [Polar.sh API Documentation](https://docs.polar.sh)

### Example Repositories
- [Better Auth Examples](https://github.com/better-auth/better-auth/tree/main/examples)
- [Drizzle Examples](https://github.com/drizzle-team/drizzle-orm/tree/main/examples)

### Community Resources
- [Better Auth Discord](https://discord.gg/better-auth)
- [Drizzle Discord](https://discord.gg/drizzle)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)

---

**Last Updated**: December 2024  
**Architecture Version**: v1.0  
**Next.js Version**: 15.3.1  
**Better Auth Version**: 1.2.8  
**Drizzle ORM Version**: 0.43.1
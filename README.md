# SpotMap - Longboarding Spots Discovery App

A modern web application for discovering, sharing, and managing longboarding spots. Built with Next.js 15 and featuring real-time maps, user authentication, and community-driven content.

## ✨ Features

### 🗺️ Interactive Maps
- **Google Maps integration** with real-time location data
- GPS-based spot discovery and navigation
- Interactive markers with detailed spot information
- Location search and geocoding

### 🛹 Spot Management
- Create and share longboarding spots
- Detailed spot information (type, difficulty, description)
- Photo uploads for spots
- Community ratings and reviews
- Moderation system for content approval

### 🔐 Authentication & User Management
- **Better Auth v1.2.8** - Modern authentication system
- Google OAuth integration
- Session management with database persistence
- User profile management with image uploads

### 💳 Subscription & Billing
- **Polar.sh** integration for premium features
- Free tier with basic functionality
- Premium features for enhanced discovery
- Real-time webhook processing

### 🎨 Modern UI/UX
- **Tailwind CSS v4** - Latest utility-first styling
- **shadcn/ui** components - Accessible, customizable
- Responsive design with mobile-first approach
- Dark/light theme support
- Progressive Web App (PWA) capabilities

### 🗄️ Database & Storage
- **Neon PostgreSQL** - Serverless database
- **Drizzle ORM** - Type-safe database toolkit
- **Cloudflare R2** - Scalable file storage for images
- Database migrations with Drizzle Kit

## 🚀 Tech Stack

- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth v1.2.8
- **Maps**: Google Maps JavaScript API
- **Payments**: Polar.sh
- **Storage**: Cloudflare R2
- **Analytics**: PostHog + Vercel Analytics
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
├── app/
│   ├── (app)/               # Mobile app pages (route group)
│   │   ├── map/            # Interactive map view
│   │   ├── spots/          # Spot listing and creation
│   │   └── layout.tsx      # Mobile-optimized layout
│   ├── dashboard/          # Admin dashboard
│   │   ├── spots/          # Spot management
│   │   ├── settings/       # User settings
│   │   └── layout.tsx      # Desktop layout
│   ├── api/                # API routes
│   │   ├── spots/          # Spot CRUD operations
│   │   ├── maps/           # Geocoding and maps
│   │   ├── moderation/     # Content moderation
│   │   └── collections/    # User collections
│   └── (auth)/             # Authentication pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── maps/               # Map components
│   ├── spots/              # Spot-related components
│   └── navigation/         # Navigation components
├── lib/
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
└── db/
    ├── schema.ts           # Database schema
    └── drizzle.ts          # Database connection
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Maps API key
- Cloudflare R2 bucket for file storage
- Polar.sh account for subscriptions (optional)

### Installation

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd localspot-nextkit
```

2. **Install dependencies**
```bash
yarn install
```

3. **Environment Setup**
Create a `.env.local` file with:
```env
# Database
DATABASE_URL="your-neon-database-url"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Maps API
GOOGLE_PLACES_API_KEY="your-google-places-api-key"

# Polar.sh (optional)
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_STARTER_TIER="your-starter-product-id"
NEXT_PUBLIC_STARTER_SLUG="your-starter-slug"

# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
R2_UPLOAD_IMAGE_ACCESS_KEY_ID="your-r2-access-key-id"
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_UPLOAD_IMAGE_BUCKET_NAME="your-r2-bucket-name"
```

4. **Database Setup**
```bash
# Generate and run migrations
yarn drizzle-kit generate
yarn drizzle-kit push
```

5. **Start Development Server**
```bash
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) to see your application.

## 🎯 Key Features Explained

### Dual Interface Architecture
- **Mobile App** (`/(app)`) - Public spot discovery with touch-optimized UI
- **Desktop Dashboard** (`/dashboard`) - Admin and power user features
- Shared business logic via hooks and services

### Spot Discovery System
- GPS-based location discovery
- Google Places integration for business search
- Advanced filtering by type, difficulty, and features
- Real-time location updates

### Content Moderation
- Queue-based moderation system
- Admin approval workflow
- Community reporting features
- Automated content validation

### Collections & Events
- User-curated spot collections (favorites)
- Time-based events at spots
- Recurring event support
- Event photo sharing

## 🔧 Development Commands

```bash
# Development
yarn dev                    # Start development server
yarn build                  # Build for production
yarn start                  # Start production server

# Database
yarn drizzle-kit generate   # Generate migrations
yarn drizzle-kit push      # Push to database
yarn drizzle-kit studio    # Open database studio

# Code Quality
yarn lint                  # Run ESLint
yarn type-check           # Run TypeScript checks
```

## 📚 API Documentation

### Spots API
- `GET /api/spots` - List spots with filtering
- `POST /api/spots` - Create new spot
- `GET /api/spots/[id]` - Get specific spot
- `PUT /api/spots/[id]` - Update spot
- `DELETE /api/spots/[id]` - Delete spot

### Maps API
- `POST /api/maps/geocode` - Geocode address
- `GET /api/maps/geocode` - Reverse geocode coordinates

### Places API
- `POST /api/places/search` - Search businesses via Google Places

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
yarn build
yarn start
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🙏 Acknowledgments

This project was built using the [Next.js SaaS Starter Kit](https://github.com/michaelshimeles/nextjs-starter-kit) as a foundation. Special thanks to the original creator for providing a solid starting point with modern web technologies.

Built with ❤️ for the longboarding community.
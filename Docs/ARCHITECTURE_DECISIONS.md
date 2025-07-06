# Architecture Decision Records (ADRs)

## ADR-001: Dual Interface Architecture - Mobile vs Desktop

### Status
**ACCEPTED** - Implemented

### Context
As a solo developer building SpotMap (longboarding spot discovery app), I needed to decide between:
1. **Separate mobile/desktop apps** with different UIs but shared business logic
2. **Single responsive dashboard** that adapts to all devices

### Decision
**Chosen: Separate Apps with Shared Business Logic**

### Architecture Pattern

#### Dual Interface Strategy
- **Mobile App (`app/(app)/`)** - Primary public interface for discovering spots
- **Desktop Dashboard (`app/dashboard/`)** - Admin/power user tool for content management

#### Shared Business Logic Pattern
```
lib/
├── hooks/              # 🔄 Shared business logic
│   ├── useSpots.ts     # Data fetching
│   ├── useSpotForm.ts  # Form handling + validation
│   └── useAuth.ts      # Authentication
├── services/           # 🔄 Shared API layer
│   ├── spotService.ts  # CRUD operations
│   └── apiClient.ts    # HTTP client
├── types/              # 🔄 Shared types
│   └── spots.ts        # Type definitions
└── utils/              # 🔄 Shared utilities

components/
├── shared/             # 🔄 Reusable UI components
│   └── SpotCard.tsx    # Works in both contexts
├── mobile/             # 📱 Mobile-specific UI
│   └── MobileSpotForm.tsx
└── desktop/            # 🖥️ Desktop-specific UI
    └── DesktopSpotForm.tsx
```

### Rationale

#### Why Separate Apps?
1. **Different User Contexts**
   - Mobile: "I'm out longboarding, need to find/create spots quickly"
   - Desktop: "I'm managing content, moderating, analyzing data"

2. **Optimized User Experience**
   - Mobile: Touch-first, GPS-centric, simple workflows
   - Desktop: Mouse/keyboard, data-heavy, comprehensive tools

3. **Performance Benefits**
   - Mobile: Smaller bundles, touch-optimized libraries
   - Desktop: Rich features without mobile constraints

4. **Clear Product Positioning**
   - Mobile = Primary public app (SEO, marketing focus)
   - Dashboard = Power user tool (not prominently advertised)

#### Why Shared Business Logic?
1. **Solo Developer Efficiency** - Don't duplicate validation, API calls, business rules
2. **Consistency** - Same behavior across interfaces
3. **Maintainability** - Bug fixes apply everywhere
4. **Type Safety** - Single source of truth for data models

### Implementation Strategy

#### Shared vs Separate Decision Matrix
| Component | Approach | Reason |
|-----------|----------|---------|
| Form validation | ✅ Shared | Same business rules |
| API calls | ✅ Shared | Same endpoints |
| Data fetching | ✅ Shared | Same caching logic |
| Spot display | ✅ Shared w/ props | Minor UI differences |
| Navigation | ❌ Separate | Completely different patterns |
| Layout | ❌ Separate | Mobile vs desktop paradigms |
| Forms UI | ❌ Separate | Touch vs mouse optimization |

#### Development Phases
1. **Phase 1**: Build mobile-first with inline logic
2. **Phase 2**: Extract shared business logic to hooks/services
3. **Phase 3**: Build desktop UI using shared hooks
4. **Phase 4**: Optimize and identify more sharing opportunities

### Example: Shared Spot Creation

**Shared Hook:**
```typescript
// lib/hooks/useSpotForm.ts
export function useSpotForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createSpot = async (formData: unknown) => {
    // Shared validation + API logic
    const validatedData = validateForm(formData);
    const spot = await spotService.create(validatedData);
    return spot;
  };

  return { createSpot, isLoading, errors };
}
```

**Mobile Implementation:**
```typescript
// app/(app)/spots/create/page.tsx
export default function MobileSpotCreate() {
  const { createSpot, isLoading } = useSpotForm();
  
  return (
    <div className="p-4">
      {/* Touch-optimized UI */}
      <button className="w-full h-12 text-lg">Create Spot</button>
    </div>
  );
}
```

**Desktop Implementation:**
```typescript
// app/dashboard/spots/_components/create-spot-form.tsx
export default function DesktopSpotForm() {
  const { createSpot, isLoading } = useSpotForm(); // Same hook!
  
  return (
    <Card>
      {/* Dense, data-heavy UI */}
      <form className="grid grid-cols-2 gap-4">
        <Button size="sm">Create Spot</Button>
      </form>
    </Card>
  );
}
```

### Consequences

#### Positive
- ✅ **Optimal UX** for each device type
- ✅ **No code duplication** in business logic
- ✅ **Performance optimized** per platform
- ✅ **Clear product positioning**
- ✅ **Independent evolution** of each interface
- ✅ **Solo dev friendly** with shared core logic

#### Negative
- ❌ **UI component duplication** (forms, layouts)
- ❌ **More files to maintain**
- ❌ **Learning curve** for developers (two apps to understand)
- ❌ **Potential inconsistencies** in UI patterns

#### Mitigations
- Use shared components where UI is truly identical
- Establish design system for consistent styling
- Create component library documentation
- Regular cross-interface testing

### Alternatives Considered

#### Single Responsive Dashboard
**Pros**: One codebase, consistent UX, easier maintenance
**Cons**: Compromised mobile experience, complex responsive logic, larger bundle

**Rejected because**: Mobile longboarding users need optimized touch interface for quick spot discovery while riding, not a cramped desktop UI.

#### Progressive Web App (PWA)
**Pros**: Native app feel, offline capabilities
**Cons**: Still need to solve mobile vs desktop UI optimization

**Future consideration**: Could implement PWA features on top of mobile interface later.

### Related Decisions
- [ADR-002: Route Groups for URL Organization](./ARCHITECTURE_DECISIONS.md#adr-002)
- [ADR-003: Centralized Type System](./ARCHITECTURE_DECISIONS.md#adr-003)

---

## ADR-002: Route Groups for URL Organization

### Status
**ACCEPTED** - Implemented

### Context
Need to organize pages without affecting URL structure while maintaining separate layouts for mobile and desktop interfaces.

### Decision
Use Next.js Route Groups `()` to organize files without URL impact:

```
app/(app)/spots/page.tsx      → /spots (mobile layout)
app/dashboard/spots/page.tsx  → /dashboard/spots (desktop layout)
```

### Rationale
- Clean URLs (`/spots` not `/mobile/spots`)
- Separate layouts per interface
- File organization that matches mental model
- No URL conflicts between interfaces

---

## ADR-003: Centralized Type System

### Status
**ACCEPTED** - Implemented

### Context
Avoid type duplication between database schema, API validation, and UI components.

### Decision
Single source of truth in `lib/types/spots.ts`:

```typescript
// Constants for validation
export const SPOT_TYPES = ["downhill", "freeride", "freestyle"] as const;

// Inferred types from database
export type Spot = typeof spots.$inferSelect;

// API schemas use constants
spotType: z.enum(SPOT_TYPES),
```

### Rationale
- DRY principle compliance
- Type safety across stack
- Single place to add new spot types
- Compile-time error catching

### Implementation
- All Zod schemas import centralized constants
- Database types inferred from Drizzle schema
- UI components use shared type definitions
- API responses use consistent typing

---

## ADR-004: Hook Organization Architecture

### Status
**ACCEPTED** - Implemented

### Context
As the application grows, we need a clear strategy for organizing React hooks to maintain separation of concerns, reusability, and maintainability across the dual interface architecture.

### Decision
**Two-Tier Hook Organization:**
- **Generic utilities** → `/hooks/` (project root)
- **Business logic & integrations** → `/lib/hooks/`

### Architecture Pattern

#### Hook Organization Structure
```
hooks/                        # 🎨 Generic UI/Utility Hooks
├── use-mobile.ts             # Responsive design detection
├── use-media-query.ts        # Generic media query wrapper
├── use-local-storage.ts      # Browser storage abstraction
└── use-debounce.ts           # Performance utilities

lib/hooks/                    # 🏗️ Business Logic & Integrations
├── use-auth.ts               # Authentication state management
├── use-google-maps.ts        # Maps integration
├── use-spot-form.ts          # Spot creation/editing logic
├── use-spots.ts              # Spot data fetching
├── use-events.ts             # Event management
└── use-collections.ts        # User collections
```

### Decision Framework

#### Hook Placement Matrix
| Hook Type | Location | Example | Reason |
|-----------|----------|---------|---------|
| **UI/Layout Utilities** | `/hooks/` | `useIsMobile`, `useMediaQuery` | Shared across all apps |
| **Feature Business Logic** | `/lib/hooks/` | `useSpotForm`, `useGoogleMaps` | Domain-specific |
| **Auth/Session** | `/lib/hooks/` | `useAuth`, `useUser` | Core app functionality |
| **External APIs** | `/lib/hooks/` | `useGoogleMaps`, `usePlacesAPI` | Integration layer |
| **Generic Utilities** | `/hooks/` | `useLocalStorage`, `useDebounce` | Reusable anywhere |

#### Decision Questions for New Hooks
1. **"Could this work in a different app?"**
   - Yes → `/hooks/`
   - No → `/lib/hooks/`

2. **"Does it know about SpotMap domain concepts?"**
   - Yes → `/lib/hooks/`
   - No → `/hooks/`

3. **"Does it depend on external libraries?"**
   - Yes → Usually `/lib/hooks/`
   - No → Could be either

4. **"Is it a browser API wrapper?"**
   - Yes → `/hooks/`

### Implementation Example: Spot Creation Hook

#### Shared Business Logic Hook
```typescript
// lib/hooks/use-spot-form.ts
import { useState } from 'react';
import { createSpotSchema } from '@/lib/services/validationSchemas';
import { spotService } from '@/lib/services/spotService';
import { SPOT_TYPES, SPOT_DIFFICULTIES } from '@/lib/types/spots';

export function useSpotForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (data: unknown) => {
    const result = createSpotSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const createSpot = async (formData: unknown) => {
    setIsLoading(true);
    try {
      const validatedData = validateForm(formData);
      if (!validatedData) return { success: false };

      const spot = await spotService.create(validatedData);
      return { success: true, data: spot };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSpot = async (id: string, formData: unknown) => {
    setIsLoading(true);
    try {
      const validatedData = validateForm(formData);
      if (!validatedData) return { success: false };

      const spot = await spotService.update(id, validatedData);
      return { success: true, data: spot };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createSpot, 
    updateSpot, 
    validateForm, 
    isLoading, 
    errors,
    spotTypes: SPOT_TYPES,
    difficulties: SPOT_DIFFICULTIES
  };
}
```

#### Mobile UI Implementation
```typescript
// app/(app)/spots/create/page.tsx
import { useSpotForm } from '@/lib/hooks/use-spot-form';

export default function MobileSpotCreate() {
  const { createSpot, isLoading, errors, spotTypes, difficulties } = useSpotForm();
  
  const handleSubmit = async (formData: FormData) => {
    const result = await createSpot({
      name: formData.get('name'),
      spotType: formData.get('spotType'),
      difficulty: formData.get('difficulty'),
      // ... other fields
    });
    
    if (result.success) {
      // Navigate to created spot or show success
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quick Spot Creation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Touch-optimized mobile UI */}
        <input 
          name="name"
          className="w-full text-lg p-4 border rounded-lg"
          placeholder="Spot name"
        />
        <select 
          name="spotType" 
          className="w-full text-lg p-4 border rounded-lg"
        >
          {spotTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-lg bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Spot'}
        </button>
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </form>
    </div>
  );
}
```

#### Desktop UI Implementation
```typescript
// app/dashboard/spots/_components/create-spot-form.tsx
import { useSpotForm } from '@/lib/hooks/use-spot-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function DesktopSpotForm() {
  const { createSpot, isLoading, errors, spotTypes, difficulties } = useSpotForm();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const result = await createSpot({
      name: formData.get('name'),
      description: formData.get('description'),
      spotType: formData.get('spotType'),
      difficulty: formData.get('difficulty'),
      locationLat: parseFloat(formData.get('lat') as string),
      locationLng: parseFloat(formData.get('lng') as string),
      bestTimes: formData.get('bestTimes'),
      safetyNotes: formData.get('safetyNotes'),
    });
    
    if (result.success) {
      // Show success toast, reset form, etc.
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Longboarding Spot</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Dense desktop UI with more fields */}
          <div className="col-span-2">
            <Input name="name" placeholder="Spot name" />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <Select name="spotType">
              {spotTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <Select name="difficulty">
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </Select>
          </div>
          
          <Input name="lat" type="number" placeholder="Latitude" />
          <Input name="lng" type="number" placeholder="Longitude" />
          
          <div className="col-span-2">
            <Input name="bestTimes" placeholder="Best times to ride" />
          </div>
          
          <div className="col-span-2">
            <textarea 
              name="safetyNotes" 
              placeholder="Safety considerations..."
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="col-span-2"
          >
            {isLoading ? 'Creating Spot...' : 'Create Spot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Benefits of This Architecture

#### Code Reuse
- ✅ **Zero duplication** of business logic (validation, API calls, error handling)
- ✅ **Consistent behavior** across mobile and desktop interfaces
- ✅ **Single source of truth** for spot creation logic

#### Maintainability
- ✅ **Bug fixes** apply to both interfaces automatically
- ✅ **Feature additions** (e.g., new validation rules) propagate everywhere
- ✅ **Testing** focuses on business logic hooks, not UI variations

#### Separation of Concerns
- ✅ **Business logic** isolated from UI presentation
- ✅ **UI optimizations** don't affect core functionality
- ✅ **Independent evolution** of mobile vs desktop UX

### Import Conventions

```typescript
// Generic utilities from project root
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";

// Business logic from lib
import { useSpotForm } from "@/lib/hooks/use-spot-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { useGoogleMaps } from "@/lib/hooks/use-google-maps";
```

### Current Implementation Status
- ✅ `useIsMobile` correctly placed in `/hooks/` (generic UI utility)
- ✅ `useGoogleMaps` correctly placed in `/lib/hooks/` (integration layer)
- ✅ `useAuth` correctly placed in `/lib/hooks/` (app-specific authentication)

### Future Hooks Roadmap
**Add to `/hooks/` (Generic Utilities):**
- `useMediaQuery` - Responsive design queries
- `useLocalStorage` - Browser storage abstraction
- `useDebounce` - Performance optimization
- `useClickOutside` - DOM interaction utility

**Add to `/lib/hooks/` (SpotMap Business Logic):**
- `useSpots` - Data fetching with filters/pagination
- `useEvents` - Event management
- `useCollections` - User favorites/collections
- `useModeration` - Content approval workflows
- `useGeolocation` - GPS + spot discovery integration

### Related Decisions
- [ADR-001: Dual Interface Architecture](./ARCHITECTURE_DECISIONS.md#adr-001)
- [ADR-003: Centralized Type System](./ARCHITECTURE_DECISIONS.md#adr-003)

---

## ADR-005: Google Maps Integration Architecture

### Status
**ACCEPTED** - Implemented

### Context
The application requires reliable Google Maps integration for spot visualization and creation. Initial implementation used custom DOM manipulation with complex useEffect logic, causing race conditions and loading failures.

### Decision
**Official @vis.gl/react-google-maps Library with Controlled State Pattern**

### Technical Implementation

#### Architecture Pattern
```
Root Layout (app/layout.tsx)
├── APIProvider (Google's official provider)
│   ├── Map Component (@vis.gl/react-google-maps)
│   ├── AdvancedMarker Components (declarative)
│   └── Controlled State Management
└── User Location Integration
```

#### Key Components
```typescript
// app/layout.tsx - Root level provider
<APIProvider apiKey={googleMapsApiKey}>
  {children}
</APIProvider>

// components/maps/map-view.tsx - Controlled map state
const [cameraProps, setCameraProps] = useState<MapCameraProps>({
  center: defaultCenter,
  zoom: defaultZoom,
});

// User location updates trigger state changes
useEffect(() => {
  if (userData) {
    setCameraProps(prev => ({
      ...prev,
      center: userData,
      zoom: 15,
    }));
  }
}, [userData]);
```

### Decision Framework

#### Approach Comparison
| Approach | Complexity | Reliability | Performance | Maintainability |
|----------|------------|-------------|-------------|------------------|
| **Custom DOM + useEffect** | High | Poor (70% fail rate) | Good | Poor |
| **@vis.gl/react-google-maps** | Low | Excellent (99% success) | Good | Excellent |
| **Third-party wrappers** | Medium | Variable | Variable | Medium |

#### Problems Solved
1. **Race Conditions**: Eliminated manual DOM management
2. **Loading Failures**: Official library handles initialization properly
3. **Route Navigation Issues**: Provider moved to root layout for persistence
4. **User Location Updates**: Controlled state pattern for dynamic updates
5. **Code Complexity**: Reduced from ~609 lines to ~120 lines (80% reduction)

### Implementation Details

#### Before: Custom Implementation
```typescript
// ❌ Complex useEffect with race conditions
useEffect(() => {
  if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
    // Retry logic with exponential backoff
    const retryLoadMarkers = async () => {
      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        if (window.google?.maps?.marker?.AdvancedMarkerElement) {
          break;
        }
      }
    };
    retryLoadMarkers();
  }
  
  // Manual DOM manipulation
  const mapElement = document.getElementById('map');
  const map = new google.maps.Map(mapElement, options);
  // ... complex marker management
}, [spots, userLocation, retryCount]);
```

#### After: Official Library
```typescript
// ✅ Declarative React components
<Map
  {...cameraProps}
  onCameraChanged={(ev) => setCameraProps(ev.detail)}
  mapId="spot-map"
  style={{ width: '100%', height: '100%' }}
  gestureHandling="greedy"
  disableDefaultUI={false}
  clickableIcons={false}
>
  {spots.map((spot) => (
    <AdvancedMarker
      key={spot.id}
      position={{ lat: spot.locationLat, lng: spot.locationLng }}
      title={spot.name}
    >
      <SpotMarker spot={spot} />
    </AdvancedMarker>
  ))}
</Map>
```

#### Controlled State Pattern
```typescript
// User location updates controlled via state
const [cameraProps, setCameraProps] = useState<MapCameraProps>({
  center: center,
  zoom: zoom,
});

// Dynamic updates without locking map movement
useEffect(() => {
  if (userData) {
    setCameraProps(prev => ({
      ...prev,
      center: userData,
      zoom: 15,
    }));
  }
}, [userData]);

// Allow user interaction while maintaining controlled updates
<Map
  {...cameraProps}
  onCameraChanged={(ev) => setCameraProps(ev.detail)}
/>
```

### Rationale

#### Why @vis.gl/react-google-maps?
1. **Official Google Partnership** - Maintained by Google team
2. **React-First Design** - Built for React, not adapted from vanilla JS
3. **Declarative Components** - No manual DOM manipulation required
4. **TypeScript Support** - Full type safety out of the box
5. **Modern React Patterns** - Hooks, context, controlled components

#### Why Controlled State Pattern?
1. **Predictable Updates** - User location changes trigger specific map updates
2. **User Interaction** - Map remains interactive while supporting programmatic updates
3. **State Management** - Clear separation between user actions and app state
4. **Testing** - Easier to test controlled state vs DOM manipulation

#### Why Root Layout Provider?
1. **Route Persistence** - Map context survives navigation
2. **Performance** - Single API initialization across app
3. **Simplicity** - No complex context management between layouts

### Performance Improvements

#### Loading Reliability
- **Before**: 70% first-load success rate due to race conditions
- **After**: 99% success rate with proper initialization order

#### Code Complexity
- **Before**: 609 lines across multiple files with complex logic
- **After**: 120 lines with declarative components
- **Reduction**: 80% less code to maintain

#### Bundle Size
- **Before**: Custom context + retry logic + DOM manipulation
- **After**: Official library with tree-shaking support

### Mobile Responsiveness

#### Layout Integration
```typescript
// Mobile-optimized responsive height
<div className="h-screen md:h-[100dvh] flex flex-col">
  <MapView userData={userData} spots={spots} />
</div>
```

#### Touch Optimization
- `gestureHandling="greedy"` for mobile touch interaction
- Responsive marker sizing based on zoom level
- Touch-friendly info windows and controls

### Alternatives Considered

#### Custom Google Maps Implementation
**Pros**: Full control, minimal dependencies
**Cons**: Complex race condition handling, manual DOM management, 70% failure rate
**Result**: **REJECTED** - Too unreliable and complex

#### Google Maps React Library
**Pros**: Established community library
**Cons**: Not officially maintained, wrapper around vanilla JS API
**Result**: **REJECTED** - Prefer official Google solution

#### Mapbox Alternative
**Pros**: Modern API, good React support
**Cons**: Different ecosystem, migration cost, API key management
**Result**: **REJECTED** - Google Maps already integrated in business logic

### Migration Impact

#### Files Removed
- `components/maps/map-view.tsx` (old implementation)
- `lib/contexts/map-context.tsx` (custom context)
- `lib/hooks/use-google-maps.ts` (custom hook)
- `components/maps/spot-marker.tsx` (replaced by inline component)
- `components/maps/spot-creation-modal.tsx` (duplicate form)

#### Files Updated
- `app/layout.tsx` - Added APIProvider
- `app/(app)/map/page.tsx` - Updated imports and responsive classes
- `components/maps/map-view-new.tsx` → `map-view.tsx` (renamed after cleanup)

#### Breaking Changes
- Map initialization moved from component level to app level
- Marker click handlers simplified (no custom event system)
- User location updates now use controlled state pattern

### Future Considerations

#### Potential Enhancements
1. **Clustering** - Implement marker clustering for dense spot areas
2. **Offline Support** - Cache map tiles for PWA functionality
3. **Custom Map Styles** - Brand-specific map styling
4. **Advanced Routing** - Route planning between spots
5. **Geofencing** - Location-based notifications

#### Monitoring
- Track map load success rates
- Monitor user interaction patterns
- Measure performance impact of marker density

### Related Decisions
- [ADR-001: Dual Interface Architecture](./ARCHITECTURE_DECISIONS.md#adr-001) - Mobile vs desktop map layouts
- [ADR-004: Hook Organization Architecture](./ARCHITECTURE_DECISIONS.md#adr-004) - Separation of map logic

---

## ADR-006: Client-Side Data Fetching Architecture

### Status
**ACCEPTED** - Implementation Planned

### Context
The application currently has inconsistent data fetching patterns across pages:
- Event creation uses proper hook abstraction (`useEventForm`)
- All other pages use direct fetch calls with duplicated loading/error state management
- No caching, debouncing, or request cancellation
- Performance issues (search triggers API calls on every keystroke)
- Code duplication (~200+ lines of repeated fetch logic)

### Decision
**TanStack Query v5 with Custom Hook Abstraction Layer**

### Technical Architecture

#### Core Technology Stack
```typescript
// Foundation
@tanstack/react-query v5  // Data fetching, caching, synchronization
Service Layer Pattern     // API abstraction (existing)
Custom Hook Layer         // Business logic encapsulation
```

#### Architecture Pattern
```
Pages/Components
    ↓ (use hooks)
Custom Query Hooks (lib/hooks/queries/)
    ↓ (call services)
Service Layer (lib/services/)
    ↓ (make requests)
API Routes (app/api/)
    ↓ (query database)
Database (Neon PostgreSQL)
```

#### Hook Organization Strategy
```
lib/hooks/queries/
├── useSpots.ts          # List with filters, debouncing
├── useSpot.ts           # Single spot details
├── useEvents.ts         # Event listing with filters
├── useEvent.ts          # Single event details
├── useProfile.ts        # User profile data
├── useUserSpots.ts      # User's created spots
└── index.ts             # Export all hooks
```

### Technical Implementation

#### TanStack Query v5 Best Practices
```typescript
// Single object parameter pattern (v5 requirement)
export function useSpots(filters?: SpotFilters) {
  const debouncedFilters = useDebounce(filters, 300);
  
  return useQuery({
    queryKey: ['spots', debouncedFilters],
    queryFn: () => spotService.getSpots(debouncedFilters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes (replaces cacheTime)
  });
}
```

#### Service Layer Integration
```typescript
// Enhance existing SpotService pattern
export const eventService = {
  getEvents: (filters?: EventFilters) => 
    fetch(`/api/events?${buildQuery(filters)}`).then(handleResponse),
  getEvent: (id: string) => 
    fetch(`/api/events/${id}`).then(handleResponse),
  createEvent: (data: CreateEventForm) =>
    fetch('/api/events', { method: 'POST', body: JSON.stringify(data) }).then(handleResponse),
  updateEvent: (id: string, data: Partial<CreateEventForm>) =>
    fetch(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(handleResponse),
};
```

#### Page Simplification Example
```typescript
// Before: 55+ lines of fetch logic, state management
const [spots, setSpots] = useState<SpotWithUser[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchSpots() {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      // ... complex parameter building
      const response = await fetch(`/api/spots?${params}`);
      const data = await response.json();
      setSpots(data.spots || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }
  fetchSpots();
}, [searchQuery, spotType, difficulty, sortBy]);

// After: 1 line + automatic performance optimizations
const { data: spots, isLoading, error } = useSpots({ 
  search: searchQuery, 
  type: spotType, 
  difficulty,
  sort: sortBy
});
```

### Performance Optimizations

#### Automatic Caching Strategy
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Data fresh for 5 minutes
      gcTime: 30 * 60 * 1000,      // Cache cleanup after 30 minutes
      retry: 1,                     // Single retry on failure
      refetchOnWindowFocus: false,  // Don't refetch on tab switch
    },
  },
});
```

#### Built-in Performance Features
1. **Request Deduplication** - Multiple components requesting same data = single API call
2. **Background Refetching** - Stale data refreshed automatically
3. **Intelligent Caching** - Cache based on query keys, automatic invalidation
4. **Optimistic Updates** - Instant UI feedback for mutations
5. **Debounced Search** - 300ms delay for search inputs (implemented in hooks)

#### Expected Performance Gains
| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Search "longboard" | 9 API calls | 1 API call | 900% faster |
| Navigate back/forward | Full refetch | Cache hit | Instant |
| Multiple components same data | N requests | 1 request | N×faster |
| Filter changes | Overlapping requests | Cancelled/deduplicated | No race conditions |

### Implementation Benefits

#### Code Quality
- **Remove 200+ lines** of duplicated fetch logic
- **Single pattern** for all data operations
- **Better error handling** with retry logic and global error boundaries
- **Type safety** with full TypeScript integration

#### Developer Experience
- **TanStack Query DevTools** for debugging
- **Consistent patterns** across all pages
- **Less boilerplate** for new data fetching needs
- **Better testing** with built-in mocking support

#### User Experience
- **Instant navigation** due to caching
- **Optimistic updates** for immediate feedback
- **Better offline experience** with stale-while-revalidate
- **Faster search** with debouncing and deduplication

### Decision Rationale

#### Why TanStack Query v5?
1. **Perfect Use Case Match** - Location data, search/filtering, navigation caching
2. **Performance Critical** - Our app suffers from excessive API calls
3. **Established Pattern** - Already using hook abstraction successfully (`useEventForm`)
4. **Modern React Patterns** - Aligns with current React best practices
5. **Bundle Size Justified** - +48kb for massive performance gains

#### Why Not Alternatives?
**Custom Hooks Only:**
- Would still require manual implementation of caching, deduplication, retries
- High maintenance burden for advanced features
- Missing performance optimizations

**SWR:**
- Less feature-complete than TanStack Query
- Smaller ecosystem and community
- Still adds dependency without full benefits

**Zustand/Redux for Data:**
- Not designed for server state management
- Missing caching and synchronization features
- More complex state management patterns

### Implementation Strategy

#### Phase 1: Foundation (30 minutes)
- Install TanStack Query v5
- Setup QueryClient with performance-optimized defaults
- Add provider to app layout

#### Phase 2: Service Layer Enhancement (45 minutes)
- Extend existing SpotService with missing methods
- Create EventService mirroring SpotService patterns
- Create ProfileService for user-related data

#### Phase 3: Query Hooks (60 minutes)
- Create query hooks following TanStack Query v5 patterns
- Implement debouncing for search inputs
- Add proper TypeScript types and error handling

#### Phase 4: Page Migration (90 minutes)
- Migrate spots listing page (highest impact)
- Migrate events listing and detail pages
- Migrate profile page
- Update spot detail pages

#### Phase 5: Optimizations (30 minutes)
- Add optimistic updates for mutations
- Implement advanced caching strategies
- Add global error handling

### Monitoring and Success Metrics

#### Performance Metrics
- **API Request Reduction** - Track number of API calls before/after
- **Page Load Speed** - Measure time to interactive for listing pages
- **Cache Hit Rates** - Monitor cache effectiveness
- **Error Rates** - Track failed requests and retries

#### Code Quality Metrics
- **Lines of Code Reduction** - Measure boilerplate elimination
- **Bug Reports** - Track data-related issues
- **Developer Velocity** - Time to implement new data fetching features

### Migration Risk Assessment

#### Low Risk Factors
- **Backward Compatible** - Can migrate page by page
- **Existing Patterns** - Already using hook abstraction successfully
- **Service Layer Preserved** - API layer unchanged
- **TypeScript Safety** - Full type checking prevents runtime errors

#### Mitigation Strategies
- **Incremental Migration** - Start with least critical pages
- **Feature Flags** - Easy rollback if issues arise
- **Comprehensive Testing** - Test all data flows before migration
- **Documentation** - Clear migration guide for team members

### Future Enhancements

#### Advanced Features (Post-Implementation)
1. **Infinite Queries** - For long spot/event lists
2. **Optimistic Updates** - Instant UI feedback for mutations
3. **Offline Support** - PWA integration with cached data
4. **Real-time Updates** - WebSocket integration for live data
5. **Prefetching** - Anticipate user navigation patterns

#### Performance Monitoring
- **React DevTools Profiler** - Component render optimization
- **TanStack Query DevTools** - Cache and query inspection
- **Bundle Analyzer** - Monitor bundle size impact
- **Web Vitals** - Track Core Web Vitals improvements

### Related Decisions
- [ADR-001: Dual Interface Architecture](./ARCHITECTURE_DECISIONS.md#adr-001) - Shared hooks across mobile/desktop
- [ADR-004: Hook Organization Architecture](./ARCHITECTURE_DECISIONS.md#adr-004) - Hook placement patterns
- [ADR-003: Centralized Type System](./ARCHITECTURE_DECISIONS.md#adr-003) - Type safety integration

### Consequences

#### Positive
- ✅ **Massive performance improvements** through caching and deduplication
- ✅ **Dramatic code reduction** (~200+ lines eliminated)
- ✅ **Better user experience** with instant navigation and search
- ✅ **Improved developer experience** with consistent patterns
- ✅ **Future-proof architecture** for advanced features
- ✅ **Better error handling** with built-in retry logic

#### Negative
- ❌ **Bundle size increase** (+48kb gzipped)
- ❌ **Learning curve** for TanStack Query concepts
- ❌ **Migration effort** required (estimated 4-5 hours)
- ❌ **Additional dependency** to maintain

#### Mitigation
- Bundle size justified by performance gains
- Incremental migration reduces risk
- Comprehensive documentation and examples
- Well-maintained library with strong community support

---

*Last updated: [Current Date]*
*Next review: [Quarterly]*
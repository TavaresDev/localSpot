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

*Last updated: [Current Date]*
*Next review: [Quarterly]*
import { 
  BusinessSearchParams, 
  BusinessSearchResponse, 
  Business, 
  LocationOption, 
  LOCATION_PRESETS 
} from "@/lib/types/business";

/**
 * Search for businesses using our API
 */
export async function searchBusinesses(
  params: BusinessSearchParams
): Promise<BusinessSearchResponse> {
  const response = await fetch("/api/places/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else if (meters < 10000) {
    return `${(meters / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(meters / 1000)}km`;
  }
}

/**
 * Format price level for display
 */
export function formatPriceLevel(priceLevel?: string): string {
  if (!priceLevel) return "";
  
  switch (priceLevel) {
    case "FREE":
      return "Free";
    case "INEXPENSIVE":
      return "$";
    case "MODERATE":
      return "$$";
    case "EXPENSIVE":
      return "$$$";
    case "VERY_EXPENSIVE":
      return "$$$$";
    default:
      return "";
  }
}

/**
 * Format rating display
 */
export function formatRating(rating?: number, count?: number): string {
  if (!rating) return "No rating";
  
  const stars = "★".repeat(Math.round(rating));
  const emptyStars = "☆".repeat(5 - Math.round(rating));
  const countText = count ? ` (${count})` : "";
  
  return `${stars}${emptyStars} ${rating.toFixed(1)}${countText}`;
}

/**
 * Get current user location using browser geolocation API
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location access denied by user"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out"));
            break;
          default:
            reject(new Error("An unknown error occurred"));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Get location options including current location if available
 */
export async function getLocationOptions(): Promise<LocationOption[]> {
  const options = [...LOCATION_PRESETS];
  
  try {
    const position = await getCurrentLocation();
    // Update the current location option with actual coordinates
    const currentLocationIndex = options.findIndex(opt => opt.id === "current");
    if (currentLocationIndex !== -1) {
      options[currentLocationIndex] = {
        ...options[currentLocationIndex],
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        radius: 5000, // Default 5km radius for current location
      };
    }
  } catch {
    // Remove current location option if geolocation fails
    const index = options.findIndex(opt => opt.id === "current");
    if (index !== -1) {
      options.splice(index, 1);
    }
  }
  
  return options;
}

/**
 * Validate search parameters
 */
export function validateSearchParams(params: Partial<BusinessSearchParams>): string[] {
  const errors: string[] = [];

  if (!params.location) {
    errors.push("Location is required");
  } else {
    if (typeof params.location.lat !== "number" || 
        params.location.lat < -90 || params.location.lat > 90) {
      errors.push("Invalid latitude");
    }
    if (typeof params.location.lng !== "number" || 
        params.location.lng < -180 || params.location.lng > 180) {
      errors.push("Invalid longitude");
    }
  }

  if (params.radius !== undefined && 
      (typeof params.radius !== "number" || params.radius < 1 || params.radius > 50000)) {
    errors.push("Radius must be between 1 and 50000 meters");
  }

  if (params.maxResults !== undefined && 
      (typeof params.maxResults !== "number" || params.maxResults < 1 || params.maxResults > 20)) {
    errors.push("Max results must be between 1 and 20");
  }

  if (params.minRating !== undefined && 
      (typeof params.minRating !== "number" || params.minRating < 0 || params.minRating > 5)) {
    errors.push("Minimum rating must be between 0 and 5");
  }

  return errors;
}

/**
 * Generate Google Maps URL for directions
 */
export function getDirectionsUrl(business: Business, origin?: { lat: number; lng: number }): string {
  if (!business.location) {
    throw new Error('Business location is required for directions');
  }
  const destination = `${business.location.lat},${business.location.lng}`;
  const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${originParam}`;
}

/**
 * Generate Google Maps URL for place details
 */
export function getPlaceUrl(business: Business): string {
  return `https://www.google.com/maps/place/?q=place_id:${business.id}`;
}

/**
 * Format business hours for display
 */
export function formatBusinessHours(hours?: string[]): string[] {
  if (!hours || hours.length === 0) {
    return ["Hours not available"];
  }
  
  return hours.map(hour => {
    // Google returns format like "Monday: 9:00 AM – 5:00 PM"
    return hour.replace(/–/g, "-"); // Normalize dash characters
  });
}

/**
 * Check if business is currently open based on opening hours
 */
export function isBusinessOpen(business: Business): boolean | null {
  if (business.isOpen !== undefined) {
    return business.isOpen;
  }
  
  // If we don't have opening status from API, return null (unknown)
  return null;
}

/**
 * Sort businesses by different criteria
 */
export function sortBusinesses(
  businesses: Business[], 
  sortBy: "distance" | "rating" | "name" | "relevance",
  userLocation?: { lat: number; lng: number }
): Business[] {
  const sorted = [...businesses];
  
  switch (sortBy) {
    case "distance":
      if (!userLocation) return sorted;
      return sorted.sort((a, b) => {
        if (!a.location || !b.location) return 0;
        const distA = calculateDistance(
          userLocation.lat, userLocation.lng,
          a.location.lat, a.location.lng
        );
        const distB = calculateDistance(
          userLocation.lat, userLocation.lng,
          b.location.lat, b.location.lng
        );
        return distA - distB;
      });
      
    case "rating":
      return sorted.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });
      
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
    case "relevance":
    default:
      // Keep original order (Google's relevance/popularity ranking)
      return sorted;
  }
}

/**
 * Filter businesses by various criteria
 */
export function filterBusinesses(
  businesses: Business[],
  filters: {
    minRating?: number;
    priceLevel?: string;
    openNow?: boolean;
    types?: string[];
  }
): Business[] {
  return businesses.filter(business => {
    // Rating filter
    if (filters.minRating && (!business.rating || business.rating < filters.minRating)) {
      return false;
    }
    
    // Price level filter
    if (filters.priceLevel && business.priceLevel !== filters.priceLevel) {
      return false;
    }
    
    // Open now filter
    if (filters.openNow && business.isOpen !== true) {
      return false;
    }
    
    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!business.businessType || !filters.types.includes(business.businessType)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
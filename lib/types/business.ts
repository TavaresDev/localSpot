// Google Places API response types
export interface PlaceDisplayName {
  text: string;
  languageCode: string;
}

export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: string[];
}

export interface PlaceOpeningHours {
  openNow: boolean;
  periods: PlaceOpeningPeriod[];
  weekdayDescriptions: string[];
}

export interface PlaceOpeningPeriod {
  open: PlaceOpeningHour;
  close?: PlaceOpeningHour;
}

export interface PlaceOpeningHour {
  day: number;
  hour: number;
  minute: number;
}

export interface PriceRange {
  startPrice: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
  endPrice: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
}

// Main Place interface from Google Places API
export interface GooglePlace {
  id: string;
  displayName: PlaceDisplayName;
  formattedAddress?: string;
  location: PlaceLocation;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: "PRICE_LEVEL_FREE" | "PRICE_LEVEL_INEXPENSIVE" | "PRICE_LEVEL_MODERATE" | "PRICE_LEVEL_EXPENSIVE" | "PRICE_LEVEL_VERY_EXPENSIVE";
  priceRange?: PriceRange;
  photos?: PlacePhoto[];
  regularOpeningHours?: PlaceOpeningHours;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  primaryType?: string;
  types?: string[];
}

// Google Places API response
export interface GooglePlacesResponse {
  places: GooglePlace[];
}

// Simplified business interface for our frontend
export interface Business {
  id: string;
  name: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  ratingCount?: number;
  priceLevel?: string;
  phone?: string;
  website?: string;
  isOpen?: boolean;
  openingHours?: string[];
  photos?: string[];
  businessType?: string;
  businessStatus?: string;
}

// Search parameters
export interface BusinessSearchParams {
  query?: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters, max 50000
  types?: string[]; // business types to include
  maxResults?: number; // max 20
  minRating?: number;
  priceLevel?: "FREE" | "INEXPENSIVE" | "MODERATE" | "EXPENSIVE" | "VERY_EXPENSIVE";
  openNow?: boolean;
}

// Location options for the selector
export interface LocationOption {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius?: number; // default radius for this location
}

// Business types for filtering
export interface BusinessType {
  id: string;
  name: string;
  icon?: string;
  googleType: string; // corresponding Google Places API type
}

// Search response for our API
export interface BusinessSearchResponse {
  businesses: Business[];
  totalResults: number;
  searchParams: BusinessSearchParams;
}

// API error response
export interface BusinessSearchError {
  error: string;
  message: string;
  code?: number;
}

// Common business types
export const BUSINESS_TYPES: BusinessType[] = [
  { id: "restaurant", name: "Restaurants", googleType: "restaurant", icon: "🍽️" },
  { id: "cafe", name: "Cafes", googleType: "cafe", icon: "☕" },
  { id: "shopping_mall", name: "Shopping Centers", googleType: "shopping_mall", icon: "🛒" },
  { id: "gas_station", name: "Gas Stations", googleType: "gas_station", icon: "⛽" },
  { id: "hospital", name: "Hospitals", googleType: "hospital", icon: "🏥" },
  { id: "pharmacy", name: "Pharmacies", googleType: "pharmacy", icon: "💊" },
  { id: "bank", name: "Banks", googleType: "bank", icon: "🏦" },
  { id: "gym", name: "Gyms", googleType: "gym", icon: "💪" },
  { id: "hair_care", name: "Hair Salons", googleType: "hair_care", icon: "✂️" },
  { id: "car_repair", name: "Auto Repair", googleType: "car_repair", icon: "🔧" },
  { id: "store", name: "General Stores", googleType: "store", icon: "🏪" },
];

// Common location presets
export const LOCATION_PRESETS: LocationOption[] = [
  {
    id: "current",
    name: "Current Location",
    coordinates: { lat: 0, lng: 0 }, // Will be updated with actual location
  },
  {
    id: "san-francisco",
    name: "San Francisco, CA",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    radius: 10000,
  },
  {
    id: "new-york",
    name: "New York, NY",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    radius: 15000,
  },
  {
    id: "los-angeles",
    name: "Los Angeles, CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    radius: 20000,
  },
  {
    id: "chicago",
    name: "Chicago, IL",
    coordinates: { lat: 41.8781, lng: -87.6298 },
    radius: 15000,
  },
  {
    id: "miami",
    name: "Miami, FL",
    coordinates: { lat: 25.7617, lng: -80.1918 },
    radius: 10000,
  },
];
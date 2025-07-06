import { searchBusinesses, getCurrentLocation } from '@/lib/business-search';
import { Business } from '@/lib/types/business';

export interface PlacesSearchParams {
  query: string;
  lat?: number;
  lng?: number;
  radius?: number;
  maxResults?: number;
}

export interface PlacesSearchResponse {
  businesses: Business[];
  location: {
    lat: number;
    lng: number;
  };
}

export class PlacesService {
  static async searchPlaces(params: PlacesSearchParams): Promise<PlacesSearchResponse> {
    if (!params.query.trim()) {
      throw new Error('Please enter a search term');
    }

    let location = { lat: 0, lng: 0 };

    // Use provided location or get current location
    if (params.lat && params.lng) {
      location = { lat: params.lat, lng: params.lng };
    } else {
      console.log('🌍 Getting user location...');
      const position = await getCurrentLocation();
      location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log('📍 Location:', location.lat, location.lng);
    }

    // Search with parameters
    const searchParams = {
      query: params.query.trim(),
      location,
      radius: params.radius || 5000, // 5km default
      maxResults: params.maxResults || 10
    };

    console.log('🔍 Searching with params:', searchParams);
    const response = await searchBusinesses(searchParams);
    console.log('✅ Search response:', response);

    return {
      businesses: response.businesses,
      location
    };
  }
}
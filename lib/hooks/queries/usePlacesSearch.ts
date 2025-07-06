import { useQuery, useMutation } from '@tanstack/react-query';
import { PlacesService, PlacesSearchParams } from '@/lib/services/placesService';
import { useDebounce } from '@/lib/hooks/use-debounce';

// Round location to ~100m precision for cache efficiency
const roundLocation = (lat: number, lng: number) => ({
  lat: Math.round(lat * 1000) / 1000, // ~111m precision
  lng: Math.round(lng * 1000) / 1000
});

export function usePlacesSearch(params: PlacesSearchParams, options?: {
  enabled?: boolean;
  autoSearch?: boolean;
}) {
  // Debounce search query to prevent API spam (only if auto-search enabled)
  const debouncedQuery = useDebounce(params.query, options?.autoSearch ? 500 : 0);
  
  // Use debounced query only for auto-search, otherwise use immediate query
  const searchQuery = options?.autoSearch ? debouncedQuery : params.query;
  
  // Round location for cache efficiency (nearby searches use same cache)
  const roundedLocation = params.lat && params.lng 
    ? roundLocation(params.lat, params.lng)
    : null;

  // Create cache key with location for location-aware caching
  const queryKey = [
    'places-search',
    searchQuery,
    roundedLocation,
    params.radius || 5000,
    params.maxResults || 10
  ];

  return useQuery({
    queryKey,
    queryFn: () => PlacesService.searchPlaces({
      ...params,
      query: searchQuery
    }),
    enabled: options?.enabled !== false && !!searchQuery?.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes (business data changes frequently)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1, // Only retry once for external API
  });
}

// Alternative hook for manual search (like current implementation)
export function usePlacesSearchMutation() {
  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: (params: PlacesSearchParams) => PlacesService.searchPlaces(params),
    // Don't cache mutations by default
  });

  return {
    search: mutate,
    results: data?.businesses || [],
    location: data?.location,
    loading: isPending,
    error: error?.message || null,
    clearResults: reset
  };
}
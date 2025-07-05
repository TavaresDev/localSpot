import { useState } from 'react';
import { searchBusinesses, getCurrentLocation } from '@/lib/business-search';
import { Business } from '@/lib/types/business';

export function useSimplePlacesSearch() {
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    try {
      // Get user's current location
      console.log('🌍 Getting user location...');
      const position = await getCurrentLocation();
      console.log('📍 Location:', position.coords.latitude, position.coords.longitude);
      
      // Search with minimal parameters
      const searchParams = {
        query: query.trim(),
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        radius: 5000, // 5km fixed radius
        maxResults: 10
      };
      
      console.log('🔍 Searching with params:', searchParams);
      const response = await searchBusinesses(searchParams);
      console.log('✅ Search response:', response);

      setResults(response.businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clearResults };
}
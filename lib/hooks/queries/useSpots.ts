import { useQuery } from '@tanstack/react-query';
import { SpotService, SpotFilters } from '@/lib/services/spotService';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function useSpots(filters?: SpotFilters) {
  // Debounce search to prevent API spam
  const debouncedFilters = useDebounce(filters, 300);
  
  return useQuery({
    queryKey: ['spots', debouncedFilters],
    queryFn: () => SpotService.getSpots(debouncedFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
import { useQuery } from '@tanstack/react-query';
import { EventService, EventFilters } from '@/lib/services/eventService';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function useEvents(filters?: EventFilters) {
  const debouncedFilters = useDebounce(filters, 300);
  
  return useQuery({
    queryKey: ['events', debouncedFilters],
    queryFn: () => EventService.getEvents(debouncedFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes (events change more frequently)
  });
}
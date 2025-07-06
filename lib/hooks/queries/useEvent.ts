import { useQuery } from '@tanstack/react-query';
import { EventService } from '@/lib/services/eventService';

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => EventService.getEvent(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}
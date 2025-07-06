import { useQuery } from '@tanstack/react-query';
import { SpotService } from '@/lib/services/spotService';

export function useSpot(id: string) {
  return useQuery({
    queryKey: ['spot', id],
    queryFn: () => SpotService.getSpot(id),
    staleTime: 10 * 60 * 1000, // 10 minutes (spot details change less frequently)
    enabled: !!id, // Don't run query if no ID
  });
}
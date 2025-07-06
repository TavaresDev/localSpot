import { useQuery } from '@tanstack/react-query';
import { ProfileService } from '@/lib/services/profileService';
import { useAuth } from '@/lib/hooks/useAuth';

export function useUserSpots(limit = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-spots', user?.id, limit],
    queryFn: () => ProfileService.getUserSpots(user!.id, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!user?.id,
  });
}

export function useUserStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => ProfileService.getUserStats(user!.id),
    staleTime: 10 * 60 * 1000,
    enabled: !!user?.id,
  });
}
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SpotService } from '@/lib/services/spotService';
import { EventService } from '@/lib/services/eventService';
import { CreateSpotForm, CreateEventForm } from '@/lib/types/spots';

export function useCreateSpot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSpotForm) => SpotService.createSpot(data),
    onSuccess: () => {
      // Invalidate spots list to refresh with new spot
      queryClient.invalidateQueries({ queryKey: ['spots'] });
    },
  });
}

export function useUpdateSpot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSpotForm> }) => 
      SpotService.updateSpot(id, data),
    onSuccess: () => {
      // Invalidate all spot-related queries
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spot'] });
    },
  });
}

export function useDeleteSpot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => SpotService.deleteSpot(id),
    onSuccess: () => {
      // Invalidate all spot-related queries
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spot'] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEventForm) => EventService.createEvent(data),
    onSuccess: () => {
      // Invalidate events list to refresh with new event
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventForm> }) => 
      EventService.updateEvent(id, data),
    onSuccess: () => {
      // Invalidate all event-related queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => EventService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate all event-related queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}
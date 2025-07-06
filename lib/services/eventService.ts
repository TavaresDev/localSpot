import { CreateEventForm, Event, EventWithSpot } from "@/lib/types/spots";

export interface EventFilters {
  spotId?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
  sort?: 'newest' | 'oldest' | 'startTime' | 'endTime';
  limit?: number;
  offset?: number;
}

export interface EventsResponse {
  events: EventWithSpot[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export class EventService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static async getEvents(filters?: EventFilters): Promise<EventsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.spotId) params.append('spotId', filters.spotId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.upcoming) params.append('upcoming', 'true');
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`/api/events?${params.toString()}`);
    return this.handleResponse<EventsResponse>(response);
  }

  static async getEvent(id: string): Promise<EventWithSpot> {
    const response = await fetch(`/api/events/${id}`);
    return this.handleResponse<EventWithSpot>(response);
  }

  static async createEvent(data: CreateEventForm): Promise<Event> {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Event>(response);
  }

  static async updateEvent(id: string, data: Partial<CreateEventForm>): Promise<Event> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<Event>(response);
  }

  static async deleteEvent(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ success: boolean }>(response);
  }
}
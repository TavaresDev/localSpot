import { CreateSpotForm, UpdateSpotForm, Spot, SpotWithUser } from "@/lib/types/spots";

// API actually returns the full spot object with user data, not a minimal response
export type CreateSpotResponse = SpotWithUser;

export interface SpotApiError {
  message: string;
  field?: string;
}

export interface SpotFilters {
  search?: string;
  type?: string;
  difficulty?: string;
  visibility?: string;
  userId?: string;
  sort?: 'newest' | 'oldest' | 'name';
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export class SpotService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    let data;
    
    try {
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text for better error messages
        const text = await response.text();
        data = { message: `Server returned non-JSON response: ${text.substring(0, 100)}...` };
      }
    } catch (error) {
      // JSON parsing failed
      data = { message: `Failed to parse server response: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  static async createSpot(spotData: CreateSpotForm): Promise<CreateSpotResponse> {
    const response = await fetch("/api/spots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(spotData),
    });

    return this.handleResponse<CreateSpotResponse>(response);
  }

  static async updateSpot(id: string, spotData: UpdateSpotForm): Promise<Spot> {
    const response = await fetch(`/api/spots/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(spotData),
    });

    return this.handleResponse<Spot>(response);
  }

  static async getSpot(id: string): Promise<SpotWithUser> {
    const response = await fetch(`/api/spots/${id}`);
    return this.handleResponse<SpotWithUser>(response);
  }

  static async deleteSpot(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/spots/${id}`, {
      method: "DELETE",
    });

    return this.handleResponse<{ success: boolean }>(response);
  }

  static async getSpots(filters?: SpotFilters): Promise<{ spots: SpotWithUser[]; pagination: any }> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.lat) params.append('lat', filters.lat.toString());
    if (filters?.lng) params.append('lng', filters.lng.toString());
    if (filters?.radius) params.append('radius', filters.radius.toString());

    const response = await fetch(`/api/spots?${params.toString()}`);
    return this.handleResponse(response);
  }
}
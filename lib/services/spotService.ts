import { CreateSpotForm, UpdateSpotForm, Spot, SpotWithUser } from "@/lib/types/spots";

// API actually returns the full spot object with user data, not a minimal response
export type CreateSpotResponse = SpotWithUser;

export interface SpotApiError {
  message: string;
  field?: string;
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

  static async getSpots(params?: {
    limit?: number;
    offset?: number;
    spotType?: string;
    difficulty?: string;
    visibility?: string;
  }): Promise<{ data: SpotWithUser[]; pagination: { limit: number; offset: number; total: number } }> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.spotType) searchParams.set("spotType", params.spotType);
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params?.visibility) searchParams.set("visibility", params.visibility);

    const response = await fetch(`/api/spots?${searchParams.toString()}`);
    return this.handleResponse(response);
  }
}
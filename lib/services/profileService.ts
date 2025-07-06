import { SpotWithUser } from "@/lib/types/spots";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
}

export interface UserStats {
  spotsCreated: number;
  eventsCreated: number;
  favorites: number;
}

export class ProfileService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  static async getUserSpots(userId: string, limit = 10): Promise<{ spots: SpotWithUser[] }> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('limit', limit.toString());

    const response = await fetch(`/api/spots?${params.toString()}`);
    return this.handleResponse(response);
  }

  static async getUserStats(userId: string): Promise<UserStats> {
    // This would need a new API endpoint
    const response = await fetch(`/api/users/${userId}/stats`);
    return this.handleResponse<UserStats>(response);
  }
}
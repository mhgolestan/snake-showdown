import { User, LeaderboardEntry, ActivePlayer, AuthResponse, ApiResponse, GameMode } from '@/types/game';

// API Configuration
// API Configuration
const isProd = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL ?? (isProd ? '' : 'http://localhost:8000');

// HTTP Client utility
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important for cookie-based auth
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle HTTP errors (4xx, 5xx)
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          // FastAPI validation errors have a 'detail' field
          if (errorData.detail) {
            const errorMessage = Array.isArray(errorData.detail)
              ? errorData.detail.map((e: any) => e.msg).join(', ')
              : errorData.detail;
            return { success: false, error: errorMessage } as T;
          }
          return errorData;
        } catch {
          // If JSON parsing fails, return generic error
          return { success: false, error: `HTTP ${response.status}: ${response.statusText}` } as T;
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error' } as T;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

const client = new ApiClient(API_URL);

// API Service - All backend calls are centralized here
export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return client.post<AuthResponse>('/auth/login', { email, password });
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    return client.post<AuthResponse>('/auth/signup', { username, email, password });
  },

  async logout(): Promise<ApiResponse<void>> {
    return client.post<ApiResponse<void>>('/auth/logout');
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    return client.get<ApiResponse<User | null>>('/auth/me');
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    const queryParam = mode ? `?mode=${mode}` : '';
    return client.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard${queryParam}`);
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    return client.post<ApiResponse<LeaderboardEntry>>('/leaderboard', { score, mode });
  },

  // Active Players (Spectator mode)
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    return client.get<ApiResponse<ActivePlayer[]>>('/players');
  },

  async getPlayerGame(playerId: string): Promise<ApiResponse<ActivePlayer | null>> {
    return client.get<ApiResponse<ActivePlayer | null>>(`/players/${playerId}`);
  },
};

export default api;

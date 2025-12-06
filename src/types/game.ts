export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'walls' | 'pass-through';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
  gridSize: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  mode: GameMode;
  createdAt: string;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  gameState: GameState;
  startedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

import { User, LeaderboardEntry, ActivePlayer, AuthResponse, ApiResponse, GameMode, GameState, Direction, Position } from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulating backend)
let currentUser: User | null = null;
let mockUsers: User[] = [
  { id: '1', username: 'SnakeMaster', email: 'snake@game.com', createdAt: '2024-01-01' },
  { id: '2', username: 'PixelPython', email: 'pixel@game.com', createdAt: '2024-01-15' },
  { id: '3', username: 'NeonGamer', email: 'neon@game.com', createdAt: '2024-02-01' },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', userId: '1', username: 'SnakeMaster', score: 2450, mode: 'walls', createdAt: '2024-03-01' },
  { id: '2', userId: '2', username: 'PixelPython', score: 1890, mode: 'pass-through', createdAt: '2024-03-02' },
  { id: '3', userId: '3', username: 'NeonGamer', score: 1650, mode: 'walls', createdAt: '2024-03-03' },
  { id: '4', userId: '1', username: 'SnakeMaster', score: 1420, mode: 'pass-through', createdAt: '2024-03-04' },
  { id: '5', userId: '2', username: 'PixelPython', score: 1200, mode: 'walls', createdAt: '2024-03-05' },
  { id: '6', userId: '3', username: 'NeonGamer', score: 980, mode: 'pass-through', createdAt: '2024-03-06' },
  { id: '7', userId: '1', username: 'SnakeMaster', score: 850, mode: 'walls', createdAt: '2024-03-07' },
  { id: '8', userId: '2', username: 'PixelPython', score: 720, mode: 'pass-through', createdAt: '2024-03-08' },
];

// Helper to create AI game state
const createAIGameState = (mode: GameMode): GameState => {
  const gridSize = 20;
  const snake: Position[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  return {
    snake,
    food: { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) },
    direction: 'RIGHT',
    score: Math.floor(Math.random() * 500),
    isGameOver: false,
    isPaused: false,
    mode,
    gridSize,
  };
};

let mockActivePlayers: ActivePlayer[] = [
  { 
    id: 'ai-1', 
    username: 'BotAlpha', 
    score: 340, 
    mode: 'walls', 
    gameState: createAIGameState('walls'),
    startedAt: new Date().toISOString() 
  },
  { 
    id: 'ai-2', 
    username: 'BotBeta', 
    score: 520, 
    mode: 'pass-through', 
    gameState: createAIGameState('pass-through'),
    startedAt: new Date().toISOString() 
  },
  { 
    id: 'ai-3', 
    username: 'BotGamma', 
    score: 180, 
    mode: 'walls', 
    gameState: createAIGameState('walls'),
    startedAt: new Date().toISOString() 
  },
];

// API Service - All backend calls are centralized here
export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 6) {
      currentUser = user;
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    if (mockUsers.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    if (mockUsers.find(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    return { success: true, user: newUser };
  },

  async logout(): Promise<ApiResponse<void>> {
    await delay(200);
    currentUser = null;
    return { success: true };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(100);
    return { success: true, data: currentUser };
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay(300);
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    entries.sort((a, b) => b.score - a.score);
    return { success: true, data: entries };
  },

  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    await delay(300);
    if (!currentUser) {
      return { success: false, error: 'Must be logged in to submit score' };
    }
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      userId: currentUser.id,
      username: currentUser.username,
      score,
      mode,
      createdAt: new Date().toISOString(),
    };
    mockLeaderboard.push(entry);
    return { success: true, data: entry };
  },

  // Active Players (Spectator mode)
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    await delay(200);
    return { success: true, data: mockActivePlayers };
  },

  async getPlayerGame(playerId: string): Promise<ApiResponse<ActivePlayer | null>> {
    await delay(100);
    const player = mockActivePlayers.find(p => p.id === playerId);
    return { success: true, data: player || null };
  },

  // Update AI player states (for simulation)
  updateAIPlayers(): void {
    mockActivePlayers = mockActivePlayers.map(player => {
      const state = player.gameState;
      if (state.isGameOver) {
        return {
          ...player,
          gameState: createAIGameState(player.mode),
          score: 0,
        };
      }

      // Simple AI logic
      const head = state.snake[0];
      const food = state.food;
      let newDirection: Direction = state.direction;

      // Move towards food
      if (Math.random() > 0.3) {
        if (food.x > head.x && state.direction !== 'LEFT') newDirection = 'RIGHT';
        else if (food.x < head.x && state.direction !== 'RIGHT') newDirection = 'LEFT';
        else if (food.y > head.y && state.direction !== 'UP') newDirection = 'DOWN';
        else if (food.y < head.y && state.direction !== 'DOWN') newDirection = 'UP';
      }

      // Calculate new head position
      let newHead = { ...head };
      switch (newDirection) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Handle walls/pass-through
      if (state.mode === 'pass-through') {
        newHead.x = (newHead.x + state.gridSize) % state.gridSize;
        newHead.y = (newHead.y + state.gridSize) % state.gridSize;
      } else {
        if (newHead.x < 0 || newHead.x >= state.gridSize || 
            newHead.y < 0 || newHead.y >= state.gridSize) {
          return {
            ...player,
            gameState: { ...state, isGameOver: true },
          };
        }
      }

      // Check self collision
      if (state.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        return {
          ...player,
          gameState: { ...state, isGameOver: true },
        };
      }

      // Move snake
      const newSnake = [newHead, ...state.snake];
      let newScore = state.score;
      let newFood = state.food;

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        newScore += 10;
        newFood = {
          x: Math.floor(Math.random() * state.gridSize),
          y: Math.floor(Math.random() * state.gridSize),
        };
      } else {
        newSnake.pop();
      }

      return {
        ...player,
        score: newScore,
        gameState: {
          ...state,
          snake: newSnake,
          food: newFood,
          direction: newDirection,
          score: newScore,
        },
      };
    });
  },
};

// Start AI simulation
setInterval(() => {
  api.updateAIPlayers();
}, 150);

export default api;

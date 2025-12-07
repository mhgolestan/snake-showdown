import { describe, it, expect, beforeEach } from 'vitest';
import { api } from './api';

describe('API Service', () => {
  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const result = await api.login('snake@game.com', 'password');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('SnakeMaster');
    });

    it('should fail login with invalid email', async () => {
      const result = await api.login('invalid@game.com', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail login with short password', async () => {
      const result = await api.login('snake@game.com', '123');
      expect(result.success).toBe(false);
    });

    it('should signup new user', async () => {
      const uniqueEmail = `test${Date.now()}@game.com`;
      const result = await api.signup('NewPlayer', uniqueEmail, 'password123');
      expect(result.success).toBe(true);
      expect(result.user?.username).toBe('NewPlayer');
    });

    it('should fail signup with existing email', async () => {
      const result = await api.signup('AnotherPlayer', 'snake@game.com', 'password123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email already exists');
    });

    it('should fail signup with short password', async () => {
      const result = await api.signup('Player', 'new@game.com', '123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Password must be at least 6 characters');
    });

    it('should logout successfully', async () => {
      await api.login('snake@game.com', 'password');
      const result = await api.logout();
      expect(result.success).toBe(true);
      
      const userResult = await api.getCurrentUser();
      expect(userResult.data).toBeNull();
    });
  });

  describe('Leaderboard', () => {
    it('should get all leaderboard entries', async () => {
      const result = await api.getLeaderboard();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeGreaterThan(0);
    });

    it('should filter leaderboard by mode', async () => {
      const result = await api.getLeaderboard('walls');
      expect(result.success).toBe(true);
      result.data?.forEach(entry => {
        expect(entry.mode).toBe('walls');
      });
    });

    it('should return sorted leaderboard by score descending', async () => {
      const result = await api.getLeaderboard();
      expect(result.success).toBe(true);
      const scores = result.data!.map(e => e.score);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });

    it('should submit score when logged in', async () => {
      await api.login('snake@game.com', 'password');
      const result = await api.submitScore(500, 'walls');
      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(500);
      expect(result.data?.mode).toBe('walls');
    });

    it('should fail to submit score when not logged in', async () => {
      await api.logout();
      const result = await api.submitScore(500, 'walls');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Must be logged in');
    });
  });

  describe('Active Players', () => {
    it('should get active players', async () => {
      const result = await api.getActivePlayers();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get player game by id', async () => {
      const playersResult = await api.getActivePlayers();
      const firstPlayer = playersResult.data![0];
      
      const result = await api.getPlayerGame(firstPlayer.id);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(firstPlayer.id);
    });

    it('should return null for non-existent player', async () => {
      const result = await api.getPlayerGame('non-existent-id');
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should have valid game state for active players', async () => {
      const result = await api.getActivePlayers();
      result.data?.forEach(player => {
        expect(player.gameState).toBeDefined();
        expect(player.gameState.snake.length).toBeGreaterThan(0);
        expect(player.gameState.gridSize).toBe(20);
      });
    });
  });
});

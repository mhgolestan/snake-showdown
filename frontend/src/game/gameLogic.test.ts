import { describe, it, expect } from 'vitest';
import {
  getInitialState,
  generateFood,
  isOppositeDirection,
  getNewHeadPosition,
  handlePassThrough,
  isOutOfBounds,
  checkSelfCollision,
  checkFoodCollision,
  moveSnake,
  GRID_SIZE,
} from './gameLogic';
import { Position, GameState } from '@/types/game';

describe('Game Logic', () => {
  describe('getInitialState', () => {
    it('should return correct initial state for walls mode', () => {
      const state = getInitialState('walls');
      expect(state.mode).toBe('walls');
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('RIGHT');
      expect(state.score).toBe(0);
      expect(state.isGameOver).toBe(false);
      expect(state.isPaused).toBe(true);
    });

    it('should return correct initial state for pass-through mode', () => {
      const state = getInitialState('pass-through');
      expect(state.mode).toBe('pass-through');
    });
  });

  describe('generateFood', () => {
    it('should generate food not on snake', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      const food = generateFood(snake, GRID_SIZE);
      const isOnSnake = snake.some(seg => seg.x === food.x && seg.y === food.y);
      expect(isOnSnake).toBe(false);
    });

    it('should generate food within grid bounds', () => {
      const snake: Position[] = [{ x: 5, y: 5 }];
      const food = generateFood(snake, GRID_SIZE);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GRID_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GRID_SIZE);
    });
  });

  describe('isOppositeDirection', () => {
    it('should detect opposite directions', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('should return false for non-opposite directions', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
    });
  });

  describe('getNewHeadPosition', () => {
    const head: Position = { x: 5, y: 5 };

    it('should move up correctly', () => {
      const newHead = getNewHeadPosition(head, 'UP');
      expect(newHead).toEqual({ x: 5, y: 4 });
    });

    it('should move down correctly', () => {
      const newHead = getNewHeadPosition(head, 'DOWN');
      expect(newHead).toEqual({ x: 5, y: 6 });
    });

    it('should move left correctly', () => {
      const newHead = getNewHeadPosition(head, 'LEFT');
      expect(newHead).toEqual({ x: 4, y: 5 });
    });

    it('should move right correctly', () => {
      const newHead = getNewHeadPosition(head, 'RIGHT');
      expect(newHead).toEqual({ x: 6, y: 5 });
    });
  });

  describe('handlePassThrough', () => {
    it('should wrap around left boundary', () => {
      const position: Position = { x: -1, y: 5 };
      const result = handlePassThrough(position, GRID_SIZE);
      expect(result.x).toBe(GRID_SIZE - 1);
    });

    it('should wrap around right boundary', () => {
      const position: Position = { x: GRID_SIZE, y: 5 };
      const result = handlePassThrough(position, GRID_SIZE);
      expect(result.x).toBe(0);
    });

    it('should wrap around top boundary', () => {
      const position: Position = { x: 5, y: -1 };
      const result = handlePassThrough(position, GRID_SIZE);
      expect(result.y).toBe(GRID_SIZE - 1);
    });

    it('should wrap around bottom boundary', () => {
      const position: Position = { x: 5, y: GRID_SIZE };
      const result = handlePassThrough(position, GRID_SIZE);
      expect(result.y).toBe(0);
    });
  });

  describe('isOutOfBounds', () => {
    it('should detect out of bounds positions', () => {
      expect(isOutOfBounds({ x: -1, y: 5 }, GRID_SIZE)).toBe(true);
      expect(isOutOfBounds({ x: GRID_SIZE, y: 5 }, GRID_SIZE)).toBe(true);
      expect(isOutOfBounds({ x: 5, y: -1 }, GRID_SIZE)).toBe(true);
      expect(isOutOfBounds({ x: 5, y: GRID_SIZE }, GRID_SIZE)).toBe(true);
    });

    it('should return false for valid positions', () => {
      expect(isOutOfBounds({ x: 0, y: 0 }, GRID_SIZE)).toBe(false);
      expect(isOutOfBounds({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 }, GRID_SIZE)).toBe(false);
      expect(isOutOfBounds({ x: 5, y: 5 }, GRID_SIZE)).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('should detect collision with body', () => {
      const head: Position = { x: 5, y: 5 };
      const body: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      expect(checkSelfCollision(head, body)).toBe(true);
    });

    it('should return false when no collision', () => {
      const head: Position = { x: 6, y: 5 };
      const body: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      expect(checkSelfCollision(head, body)).toBe(false);
    });
  });

  describe('checkFoodCollision', () => {
    it('should detect food collision', () => {
      expect(checkFoodCollision({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(true);
    });

    it('should return false when no collision', () => {
      expect(checkFoodCollision({ x: 5, y: 5 }, { x: 6, y: 5 })).toBe(false);
    });
  });

  describe('moveSnake', () => {
    it('should not move when game is paused', () => {
      const state = getInitialState('walls');
      const newState = moveSnake(state);
      expect(newState).toEqual(state);
    });

    it('should not move when game is over', () => {
      const state: GameState = { ...getInitialState('walls'), isGameOver: true };
      const newState = moveSnake(state);
      expect(newState).toEqual(state);
    });

    it('should move snake in current direction', () => {
      const state: GameState = {
        ...getInitialState('walls'),
        isPaused: false,
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      };
      const newState = moveSnake(state);
      expect(newState.snake[0]).toEqual({ x: 11, y: 10 });
      expect(newState.snake.length).toBe(3);
    });

    it('should grow snake when eating food', () => {
      const state: GameState = {
        ...getInitialState('walls'),
        isPaused: false,
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        food: { x: 11, y: 10 },
      };
      const newState = moveSnake(state);
      expect(newState.snake.length).toBe(3);
      expect(newState.score).toBe(10);
    });

    it('should end game on wall collision in walls mode', () => {
      const state: GameState = {
        ...getInitialState('walls'),
        isPaused: false,
        snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
        direction: 'RIGHT',
      };
      const newState = moveSnake(state);
      expect(newState.isGameOver).toBe(true);
    });

    it('should wrap around in pass-through mode', () => {
      const state: GameState = {
        ...getInitialState('pass-through'),
        isPaused: false,
        snake: [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }],
        direction: 'RIGHT',
      };
      const newState = moveSnake(state);
      expect(newState.isGameOver).toBe(false);
      expect(newState.snake[0].x).toBe(0);
    });

    it('should end game on self collision', () => {
      const state: GameState = {
        ...getInitialState('walls'),
        isPaused: false,
        snake: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 6, y: 4 },
          { x: 5, y: 4 },
          { x: 4, y: 4 },
          { x: 4, y: 5 },
        ],
        direction: 'UP',
      };
      const newState = moveSnake(state);
      expect(newState.isGameOver).toBe(true);
    });

    it('should not allow opposite direction change', () => {
      const state: GameState = {
        ...getInitialState('walls'),
        isPaused: false,
        direction: 'RIGHT',
      };
      const newState = moveSnake(state, 'LEFT');
      expect(newState.direction).toBe('RIGHT');
    });

    it('should allow perpendicular direction change', () => {
      const state: GameState = {
        ...getInitialState('walls'),
        isPaused: false,
        direction: 'RIGHT',
      };
      const newState = moveSnake(state, 'UP');
      expect(newState.direction).toBe('UP');
    });
  });
});

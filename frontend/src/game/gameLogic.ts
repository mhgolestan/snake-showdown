import { GameState, Direction, Position, GameMode } from '@/types/game';

export const GRID_SIZE = 20;

export const getInitialState = (mode: GameMode): GameState => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  food: { x: 15, y: 10 },
  direction: 'RIGHT',
  score: 0,
  isGameOver: false,
  isPaused: true,
  mode,
  gridSize: GRID_SIZE,
});

export const generateFood = (snake: Position[], gridSize: number): Position => {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  return newFood;
};

export const isOppositeDirection = (dir1: Direction, dir2: Direction): boolean => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir1] === dir2;
};

export const getNewHeadPosition = (head: Position, direction: Direction): Position => {
  const newHead = { ...head };
  switch (direction) {
    case 'UP':
      newHead.y -= 1;
      break;
    case 'DOWN':
      newHead.y += 1;
      break;
    case 'LEFT':
      newHead.x -= 1;
      break;
    case 'RIGHT':
      newHead.x += 1;
      break;
  }
  return newHead;
};

export const handlePassThrough = (position: Position, gridSize: number): Position => ({
  x: (position.x + gridSize) % gridSize,
  y: (position.y + gridSize) % gridSize,
});

export const isOutOfBounds = (position: Position, gridSize: number): boolean => {
  return (
    position.x < 0 ||
    position.x >= gridSize ||
    position.y < 0 ||
    position.y >= gridSize
  );
};

export const checkSelfCollision = (head: Position, body: Position[]): boolean => {
  return body.some(seg => seg.x === head.x && seg.y === head.y);
};

export const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

export const moveSnake = (state: GameState, newDirection?: Direction): GameState => {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = newDirection && !isOppositeDirection(newDirection, state.direction) 
    ? newDirection 
    : state.direction;

  let newHead = getNewHeadPosition(state.snake[0], direction);

  // Handle wall collision based on mode
  if (state.mode === 'pass-through') {
    newHead = handlePassThrough(newHead, state.gridSize);
  } else {
    // Walls mode - game over on wall collision
    if (isOutOfBounds(newHead, state.gridSize)) {
      return { ...state, isGameOver: true, direction };
    }
  }

  // Check self collision (excluding tail which will move)
  const bodyWithoutTail = state.snake.slice(0, -1);
  if (checkSelfCollision(newHead, bodyWithoutTail)) {
    return { ...state, isGameOver: true, direction };
  }

  const newSnake = [newHead, ...state.snake];
  let newScore = state.score;
  let newFood = state.food;

  // Check food collision
  if (checkFoodCollision(newHead, state.food)) {
    newScore += 10;
    newFood = generateFood(newSnake, state.gridSize);
  } else {
    newSnake.pop();
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    score: newScore,
    direction,
  };
};

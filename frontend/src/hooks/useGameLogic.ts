import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, Position, GameMode } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const getInitialState = (mode: GameMode): GameState => ({
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

export const useGameLogic = (mode: GameMode) => {
  const [gameState, setGameState] = useState<GameState>(() => getInitialState(mode));
  const directionRef = useRef<Direction>(gameState.direction);
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback((snake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.isGameOver || prevState.isPaused) return prevState;

      const head = prevState.snake[0];
      let newHead = { ...head };

      switch (directionRef.current) {
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

      // Handle wall collision based on mode
      if (prevState.mode === 'pass-through') {
        newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
        newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
      } else {
        // Walls mode - game over on wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          return { ...prevState, isGameOver: true, direction: directionRef.current };
        }
      }

      // Check self collision
      if (prevState.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        return { ...prevState, isGameOver: true, direction: directionRef.current };
      }

      const newSnake = [newHead, ...prevState.snake];
      let newScore = prevState.score;
      let newFood = prevState.food;

      // Check food collision
      if (newHead.x === prevState.food.x && newHead.y === prevState.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore,
        direction: directionRef.current,
      };
    });
  }, [generateFood]);

  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== directionRef.current) {
      directionRef.current = newDirection;
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resetGame = useCallback(() => {
    const newState = getInitialState(mode);
    directionRef.current = newState.direction;
    setGameState(newState);
  }, [mode]);

  const setMode = useCallback((newMode: GameMode) => {
    const newState = getInitialState(newMode);
    directionRef.current = newState.direction;
    setGameState(newState);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, INITIAL_SPEED);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPaused, gameState.isGameOver, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.isGameOver) {
            resetGame();
          } else if (gameState.isPaused) {
            startGame();
          } else {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, gameState.isGameOver, gameState.isPaused, pauseGame, resetGame, startGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    setMode,
  };
};

export default useGameLogic;

import React from 'react';
import { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  isSpectating?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, isSpectating = false }) => {
  const { snake, food, gridSize, isGameOver, isPaused } = gameState;

  const cellSize = 100 / gridSize;

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
      {/* Game board container */}
      <div 
        className={cn(
          "w-full h-full neon-border rounded-lg overflow-hidden relative",
          "bg-background/80 arcade-grid",
          isGameOver && "opacity-70"
        )}
      >
        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines z-10" />
        
        {/* Food */}
        <div
          className="absolute rounded-sm animate-pulse-glow"
          style={{
            left: `${food.x * cellSize}%`,
            top: `${food.y * cellSize}%`,
            width: `${cellSize}%`,
            height: `${cellSize}%`,
            backgroundColor: 'hsl(var(--food))',
            boxShadow: '0 0 10px hsl(var(--food-glow)), 0 0 20px hsl(var(--food-glow))',
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={cn(
              "absolute rounded-sm transition-all duration-75",
              index === 0 && "z-20"
            )}
            style={{
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              backgroundColor: index === 0 
                ? 'hsl(var(--snake))' 
                : `hsl(120, ${100 - index * 2}%, ${50 - index}%)`,
              boxShadow: index === 0 
                ? '0 0 10px hsl(var(--snake-glow)), 0 0 20px hsl(var(--snake-glow))' 
                : 'none',
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
            <div className="text-center">
              <h2 className="font-pixel text-xl md:text-2xl text-destructive text-glow-pink mb-4">
                GAME OVER
              </h2>
              <p className="font-pixel text-sm text-foreground">
                Score: {gameState.score}
              </p>
              {!isSpectating && (
                <p className="font-pixel text-xs text-muted-foreground mt-4 animate-blink">
                  Press SPACE to restart
                </p>
              )}
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
            <div className="text-center">
              <h2 className="font-pixel text-xl md:text-2xl text-foreground text-glow mb-4">
                {isSpectating ? 'SPECTATING' : 'PAUSED'}
              </h2>
              {!isSpectating && (
                <p className="font-pixel text-xs text-muted-foreground animate-blink">
                  Press SPACE to start
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;

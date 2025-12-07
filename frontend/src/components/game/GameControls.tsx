import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  mode: GameMode;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  mode,
  isPaused,
  isGameOver,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Score Display */}
      <div className="text-center">
        <p className="font-pixel text-xs text-muted-foreground mb-1">SCORE</p>
        <p className="font-pixel text-3xl text-foreground text-glow">{score}</p>
      </div>

      {/* Mode Selection */}
      <div className="space-y-2">
        <p className="font-pixel text-xs text-muted-foreground text-center">MODE</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'walls' ? 'neon' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('walls')}
            className="flex-1 font-pixel text-[10px]"
          >
            Walls
          </Button>
          <Button
            variant={mode === 'pass-through' ? 'neon' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('pass-through')}
            className="flex-1 font-pixel text-[10px]"
          >
            Pass-Through
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2 justify-center">
        {isGameOver ? (
          <Button variant="neon" size="lg" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        ) : isPaused ? (
          <Button variant="neon" size="lg" onClick={onStart} className="gap-2">
            <Play className="w-4 h-4" />
            Play
          </Button>
        ) : (
          <Button variant="outline" size="lg" onClick={onPause} className="gap-2">
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        )}
        {!isGameOver && (
          <Button variant="ghost" size="lg" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Controls Help */}
      <div className="text-center space-y-1">
        <p className="font-pixel text-[10px] text-muted-foreground">CONTROLS</p>
        <p className="text-xs text-muted-foreground">Arrow Keys or WASD</p>
        <p className="text-xs text-muted-foreground">SPACE to Pause/Play</p>
      </div>
    </div>
  );
};

export default GameControls;

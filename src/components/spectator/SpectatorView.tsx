import React, { useEffect, useState } from 'react';
import { ActivePlayer } from '@/types/game';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { GameBoard } from '@/components/game/GameBoard';
import { Eye, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpectatorViewProps {
  onClose?: () => void;
}

export const SpectatorView: React.FC<SpectatorViewProps> = ({ onClose }) => {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await api.getActivePlayers();
      if (response.success && response.data) {
        setPlayers(response.data);
        if (!selectedPlayer && response.data.length > 0) {
          setSelectedPlayer(response.data[0]);
        }
      }
      setLoading(false);
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 150);
    return () => clearInterval(interval);
  }, [selectedPlayer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-pixel text-sm text-muted-foreground animate-pulse">
          Loading players...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-neon-cyan" />
          <h2 className="font-pixel text-xl text-foreground text-glow-cyan">SPECTATOR MODE</h2>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="font-pixel text-xs gap-2">
            <ArrowLeft className="w-4 h-4" />
            BACK
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Player List */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-pixel text-xs">ACTIVE PLAYERS</span>
          </div>

          <div className="space-y-2">
            {players.length === 0 ? (
              <p className="font-pixel text-xs text-muted-foreground p-4 text-center">
                No active players
              </p>
            ) : (
              players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all text-left",
                    selectedPlayer?.id === player.id
                      ? "border-neon-cyan bg-neon-cyan/10"
                      : "border-border hover:border-neon-cyan/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs text-foreground">
                      {player.username}
                    </span>
                    {player.gameState.isGameOver && (
                      <span className="font-pixel text-[8px] text-destructive">
                        GAME OVER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Score: {player.score}
                    </span>
                    <span className={cn(
                      "font-pixel text-[8px] px-1.5 py-0.5 rounded",
                      player.mode === 'walls'
                        ? "bg-destructive/20 text-destructive"
                        : "bg-accent/20 text-accent"
                    )}>
                      {player.mode === 'walls' ? 'WALLS' : 'PASS'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Game View */}
        <div className="md:col-span-2">
          {selectedPlayer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-pixel text-sm text-foreground">
                    {selectedPlayer.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Playing {selectedPlayer.mode === 'walls' ? 'Walls' : 'Pass-Through'} mode
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-pixel text-xs text-muted-foreground">SCORE</p>
                  <p className="font-pixel text-2xl text-foreground text-glow-cyan">
                    {selectedPlayer.score}
                  </p>
                </div>
              </div>

              <GameBoard gameState={selectedPlayer.gameState} isSpectating />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] neon-border rounded-lg">
              <p className="font-pixel text-sm text-muted-foreground">
                Select a player to watch
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpectatorView;

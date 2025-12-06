import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  onClose?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const response = await api.getLeaderboard(filter === 'all' ? undefined : filter);
      if (response.success && response.data) {
        setEntries(response.data);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center font-pixel text-xs">{rank}</span>;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-pixel text-xl text-foreground text-glow">LEADERBOARD</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="font-pixel text-xs">
            BACK
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'neon' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className="font-pixel text-[10px]"
        >
          ALL
        </Button>
        <Button
          variant={filter === 'walls' ? 'neon' : 'ghost'}
          size="sm"
          onClick={() => setFilter('walls')}
          className="font-pixel text-[10px]"
        >
          WALLS
        </Button>
        <Button
          variant={filter === 'pass-through' ? 'neon' : 'ghost'}
          size="sm"
          onClick={() => setFilter('pass-through')}
          className="font-pixel text-[10px]"
        >
          PASS-THROUGH
        </Button>
      </div>

      {/* Leaderboard Table */}
      <div className="neon-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-2 font-pixel text-[10px] text-muted-foreground">
          <div className="col-span-1">RANK</div>
          <div className="col-span-5">PLAYER</div>
          <div className="col-span-3 text-right">SCORE</div>
          <div className="col-span-3 text-right">MODE</div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="font-pixel text-sm text-muted-foreground animate-pulse">Loading...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-pixel text-sm text-muted-foreground">No scores yet!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "px-4 py-3 grid grid-cols-12 gap-2 items-center transition-colors hover:bg-muted/30",
                  index === 0 && "bg-primary/10",
                  index === 1 && "bg-muted/20",
                  index === 2 && "bg-muted/10"
                )}
              >
                <div className="col-span-1 flex items-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="col-span-5">
                  <p className={cn(
                    "font-pixel text-xs",
                    index < 3 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {entry.username}
                  </p>
                </div>
                <div className="col-span-3 text-right">
                  <p className={cn(
                    "font-pixel text-sm",
                    index === 0 && "text-glow"
                  )}>
                    {entry.score}
                  </p>
                </div>
                <div className="col-span-3 text-right">
                  <span className={cn(
                    "font-pixel text-[10px] px-2 py-1 rounded",
                    entry.mode === 'walls' 
                      ? "bg-destructive/20 text-destructive" 
                      : "bg-accent/20 text-accent"
                  )}>
                    {entry.mode === 'walls' ? 'WALLS' : 'PASS'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

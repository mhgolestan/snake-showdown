import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/game';
import { LogIn, LogOut, User as UserIcon, Trophy, Eye, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onLeaderboardClick: () => void;
  onSpectateClick: () => void;
  onPlayClick: () => void;
  currentView: 'game' | 'leaderboard' | 'spectator';
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLoginClick,
  onLogout,
  onLeaderboardClick,
  onSpectateClick,
  onPlayClick,
  currentView,
}) => {
  return (
    <header className="w-full border-b-2 border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center box-glow">
            <span className="font-pixel text-lg text-primary">🐍</span>
          </div>
          <h1 className="font-pixel text-lg md:text-xl text-foreground text-glow hidden sm:block">
            SNAKE
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button
            variant={currentView === 'game' ? 'neon' : 'ghost'}
            size="sm"
            onClick={onPlayClick}
            className="gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline font-pixel text-[10px]">PLAY</span>
          </Button>
          <Button
            variant={currentView === 'leaderboard' ? 'neon' : 'ghost'}
            size="sm"
            onClick={onLeaderboardClick}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline font-pixel text-[10px]">RANKS</span>
          </Button>
          <Button
            variant={currentView === 'spectator' ? 'neon-cyan' : 'ghost'}
            size="sm"
            onClick={onSpectateClick}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline font-pixel text-[10px]">WATCH</span>
          </Button>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                <UserIcon className="w-4 h-4 text-primary" />
                <span className="font-pixel text-[10px] text-foreground">
                  {user.username}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-pixel text-[10px]">LOGOUT</span>
              </Button>
            </>
          ) : (
            <Button variant="neon-pink" size="sm" onClick={onLoginClick} className="gap-2">
              <LogIn className="w-4 h-4" />
              <span className="font-pixel text-[10px]">LOGIN</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

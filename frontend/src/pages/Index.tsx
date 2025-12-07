import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { MobileControls } from '@/components/game/MobileControls';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SpectatorView } from '@/components/spectator/SpectatorView';
import { AuthModal } from '@/components/auth/AuthModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { toast } from 'sonner';

type View = 'game' | 'leaderboard' | 'spectator';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('game');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const { gameState, startGame, pauseGame, resetGame, setMode, changeDirection } = useGameLogic('walls');

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const handleGameOver = async () => {
    if (user && gameState.score > 0) {
      const result = await api.submitScore(gameState.score, gameState.mode);
      if (result.success) {
        toast.success('Score submitted to leaderboard!');
      }
    }
  };

  // Submit score when game ends
  React.useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      handleGameOver();
    }
  }, [gameState.isGameOver]);

  return (
    <div className="min-h-screen bg-background arcade-grid">
      <Header
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onLeaderboardClick={() => setCurrentView('leaderboard')}
        onSpectateClick={() => setCurrentView('spectator')}
        onPlayClick={() => setCurrentView('game')}
        currentView={currentView}
      />

      <main className="container mx-auto px-4 py-8 pb-20">
        {currentView === 'game' && (
          <div className="grid lg:grid-cols-4 gap-8 items-start">
            {/* Game Area */}
            <div className="lg:col-span-3">
              <div className="mb-6 text-center">
                <h1 className="font-pixel text-lg md:text-2xl text-foreground text-glow mb-2">
                  SNAKE ARCADE
                </h1>
                <p className="font-pixel text-xs text-muted-foreground">
                  {gameState.mode === 'walls' ? 'WALLS MODE' : 'PASS-THROUGH MODE'}
                </p>
                {!user && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="text-primary hover:underline"
                    >
                      Log in
                    </button>
                    {' '}to save your scores to the leaderboard
                  </p>
                )}
              </div>
              <GameBoard gameState={gameState} />
              <MobileControls 
                onDirectionChange={changeDirection}
                disabled={gameState.isPaused || gameState.isGameOver}
              />
            </div>

            {/* Controls Sidebar */}
            <div className="lg:col-span-1">
              <div className="neon-border rounded-lg p-6 bg-card/50">
                <GameControls
                  mode={gameState.mode}
                  isPaused={gameState.isPaused}
                  isGameOver={gameState.isGameOver}
                  score={gameState.score}
                  onStart={startGame}
                  onPause={pauseGame}
                  onReset={resetGame}
                  onModeChange={setMode}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'leaderboard' && (
          <Leaderboard onClose={() => setCurrentView('game')} />
        )}

        {currentView === 'spectator' && (
          <SpectatorView onClose={() => setCurrentView('game')} />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center border-t border-border bg-background/80 backdrop-blur-sm">
        <p className="font-pixel text-[10px] text-muted-foreground">
          Made with 🐍 • Press SPACE to start
        </p>
      </footer>
    </div>
  );
};

export default Index;

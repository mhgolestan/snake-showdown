import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          toast.success('Welcome back!');
          onClose();
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        const result = await signup(username, email, password);
        if (result.success) {
          toast.success('Account created successfully!');
          onClose();
        } else {
          toast.error(result.error || 'Signup failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-2 border-primary box-glow max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl text-foreground text-glow text-center">
            {mode === 'login' ? 'LOG IN' : 'SIGN UP'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username" className="font-pixel text-xs text-muted-foreground">
                USERNAME
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-input border-border focus:border-primary focus:ring-primary"
                placeholder="Enter your username"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-pixel text-xs text-muted-foreground">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input border-border focus:border-primary focus:ring-primary"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-pixel text-xs text-muted-foreground">
              PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-input border-border focus:border-primary focus:ring-primary"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant="neon"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="font-pixel text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' 
                ? "Don't have an account? SIGN UP" 
                : "Already have an account? LOG IN"}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-center text-xs text-muted-foreground">
              <p>Demo: snake@game.com / password</p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

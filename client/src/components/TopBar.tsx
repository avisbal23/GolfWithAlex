import { Sun, Moon, HelpCircle, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/hooks/use-auth';

interface TopBarProps {
  onHelpClick: () => void;
  onViewScoreClick: () => void;
  onProfileClick: () => void;
}

export function TopBar({ onHelpClick, onViewScoreClick, onProfileClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="h-11 px-3 flex items-center justify-between gap-2 border-b bg-card/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]" data-testid="container-top-bar">
      <h1 className="text-base font-semibold tracking-tight text-foreground" data-testid="text-app-title">
        GolfWithAlex
      </h1>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onViewScoreClick}
          data-testid="button-view-score"
        >
          View Current Scorecard
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onHelpClick}
          data-testid="button-help"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </Button>

        {!isLoading && (
          <Button
            size="icon"
            variant="ghost"
            onClick={isAuthenticated ? onProfileClick : () => window.location.href = '/api/login'}
            data-testid="button-profile"
            aria-label={isAuthenticated ? 'Profile' : 'Sign in'}
          >
            {isAuthenticated ? (
              <User className="w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}

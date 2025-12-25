import { Sun, Moon, HelpCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

interface TopBarProps {
  onHelpClick: () => void;
  onViewScoreClick: () => void;
}

export function TopBar({ onHelpClick, onViewScoreClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 px-4 flex items-center justify-between gap-2 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">
        GolfWithAlex
      </h1>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onViewScoreClick}
          data-testid="button-view-score"
          aria-label="View current score"
        >
          <BarChart3 className="w-5 h-5" />
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
      </div>
    </header>
  );
}

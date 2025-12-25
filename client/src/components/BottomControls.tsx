import { ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BottomControlsProps {
  currentHole: number;
  totalHoles: number;
  par: number | null;
  onParChange: (par: number | null) => void;
  onFinishHole: () => void;
  onResetHole: () => void;
  isLastHole: boolean;
}

export function BottomControls({
  currentHole,
  totalHoles,
  par,
  onParChange,
  onFinishHole,
  onResetHole,
  isLastHole,
}: BottomControlsProps) {
  const handleParChange = (value: string) => {
    const num = parseInt(value, 10);
    if (value === '' || isNaN(num)) {
      onParChange(null);
    } else if (num >= 1 && num <= 9) {
      onParChange(num);
    }
  };

  return (
    <div className="px-3 py-2 border-t bg-card/80 backdrop-blur-sm space-y-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-center gap-3">
        <div className="text-center" data-testid="text-hole-indicator">
          <span className="text-base font-semibold" data-testid="text-current-hole">
            Hole {currentHole}
          </span>
          <span className="text-sm text-muted-foreground" data-testid="text-total-holes"> / {totalHoles}</span>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="par-input" className="text-sm font-medium whitespace-nowrap">
            Par
          </Label>
          <Input
            id="par-input"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={9}
            value={par ?? ''}
            onChange={(e) => handleParChange(e.target.value)}
            placeholder="?"
            className="w-12 h-8 text-center text-base font-semibold"
            data-testid="input-par"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetHole}
          data-testid="button-reset-hole"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={onFinishHole}
          data-testid="button-finish-hole"
        >
          {isLastHole ? 'Finish Round' : 'Finish Hole'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

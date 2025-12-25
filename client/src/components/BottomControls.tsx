import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BottomControlsProps {
  currentHole: number;
  totalHoles: number;
  par: number | null;
  onParChange: (par: number | null) => void;
  onFinishHole: () => void;
  isLastHole: boolean;
}

export function BottomControls({
  currentHole,
  totalHoles,
  par,
  onParChange,
  onFinishHole,
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
    <div className="px-4 py-3 border-t bg-card/80 backdrop-blur-sm space-y-3 sticky bottom-0 z-50">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center" data-testid="text-hole-indicator">
          <span className="text-lg font-semibold" data-testid="text-current-hole">
            Hole {currentHole}
          </span>
          <span className="text-muted-foreground" data-testid="text-total-holes"> / {totalHoles}</span>
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
            className="w-14 h-10 text-center text-lg font-semibold"
            data-testid="input-par"
          />
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold"
        onClick={onFinishHole}
        data-testid="button-finish-hole"
      >
        {isLastHole ? 'Finish Round' : 'Finish Hole'}
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}

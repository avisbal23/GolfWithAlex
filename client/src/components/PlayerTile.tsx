import { useRef, useCallback, useState } from 'react';
import { getScoreBorderClass } from '@/lib/types';

interface PlayerTileProps {
  name: string;
  strokes: number;
  par: number | null;
  showHint: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  testId: string;
}

export function PlayerTile({
  name,
  strokes,
  par,
  showHint,
  onIncrement,
  onDecrement,
  testId,
}: PlayerTileProps) {
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldRef = useRef(false);
  const isTouchRef = useRef(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const borderClass = getScoreBorderClass(strokes, par);

  const startHold = useCallback((isTouch: boolean) => {
    // Prevent mouse events if we're in touch mode
    if (!isTouch && isTouchRef.current) {
      return;
    }
    if (isTouch) {
      isTouchRef.current = true;
    }
    
    isHoldRef.current = false;
    setIsPressed(true);
    
    holdTimerRef.current = setTimeout(() => {
      isHoldRef.current = true;
      setIsHolding(true);
      onDecrement();
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 400);
  }, [onDecrement]);

  const endHold = useCallback((isTouch: boolean) => {
    // Prevent mouse events if we're in touch mode
    if (!isTouch && isTouchRef.current) {
      return;
    }
    
    setIsPressed(false);
    setIsHolding(false);
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (!isHoldRef.current) {
      onIncrement();
      // Light haptic on tap
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
    
    isHoldRef.current = false;
    
    // Reset touch flag after processing, with delay to block any pending mouse events
    if (isTouch) {
      setTimeout(() => { isTouchRef.current = false; }, 100);
    }
  }, [onIncrement]);

  const cancelHold = useCallback(() => {
    setIsPressed(false);
    setIsHolding(false);
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    isHoldRef.current = false;
  }, []);

  // Get background style based on score
  const getBackgroundStyle = () => {
    if (par === null || par === 0) {
      return 'bg-card';
    }
    
    const diff = strokes - par;
    
    if (diff === 0) return 'bg-[hsl(var(--score-par)/0.15)]';
    if (diff === -1 || diff <= -2) return 'bg-[hsl(var(--score-birdie)/0.15)]';
    if (diff === 1) return 'bg-[hsl(var(--score-bogey)/0.15)]';
    if (diff === 2) return 'bg-[hsl(var(--score-double)/0.15)]';
    if (diff >= 3) return 'bg-[hsl(var(--score-triple)/0.15)]';
    
    return 'bg-card';
  };

  return (
    <button
      type="button"
      className={`
        relative flex flex-col w-full min-h-[280px] max-h-[400px]
        rounded-2xl border-[3px] p-4 transition-all duration-100
        select-none touch-manipulation cursor-pointer
        ${borderClass}
        ${getBackgroundStyle()}
        ${isPressed ? 'scale-[0.98]' : ''}
        ${isHolding ? 'scale-[0.96] opacity-90' : ''}
      `}
      onMouseDown={() => startHold(false)}
      onMouseUp={() => endHold(false)}
      onMouseLeave={cancelHold}
      onTouchStart={() => startHold(true)}
      onTouchEnd={() => endHold(true)}
      onTouchCancel={cancelHold}
      data-testid={testId}
      aria-label={`${name}: ${strokes} strokes. Tap to add, hold to subtract.`}
    >
      <div className="w-full pb-2 mb-2 border-b-2 border-current/20">
        <span className="text-lg font-medium truncate block text-center" data-testid={`${testId}-name`}>
          {name}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <span className="text-5xl font-bold tabular-nums" data-testid={`${testId}-strokes`}>
          {strokes}
        </span>
      </div>

      {showHint && (
        <div className="absolute bottom-3 left-0 right-0 text-center" data-testid={`${testId}-hint`}>
          <span className="text-xs text-muted-foreground opacity-60">
            tap +1 / hold -1
          </span>
        </div>
      )}
    </button>
  );
}

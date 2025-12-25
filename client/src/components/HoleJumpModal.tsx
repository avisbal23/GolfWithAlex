import { useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HoleJumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHole: number;
  totalHoles: number;
  onSelectHole: (hole: number) => void;
}

export function HoleJumpModal({
  isOpen,
  onClose,
  currentHole,
  totalHoles,
  onSelectHole,
}: HoleJumpModalProps) {
  const currentHoleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && currentHoleRef.current) {
      setTimeout(() => {
        currentHoleRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
      }, 100);
    }
  }, [isOpen]);

  const holes = Array.from({ length: totalHoles }, (_, i) => i + 1);

  const handleSelectHole = (hole: number) => {
    onSelectHole(hole);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs" data-testid="dialog-hole-jump">
        <DialogHeader>
          <DialogTitle data-testid="text-hole-jump-title">
            Jump to Hole
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-64 pr-4">
          <div className="space-y-1">
            {holes.map((hole) => (
              <Button
                key={hole}
                ref={hole === currentHole ? currentHoleRef : undefined}
                variant={hole === currentHole ? 'default' : 'ghost'}
                className="w-full justify-center text-lg"
                onClick={() => handleSelectHole(hole)}
                data-testid={`button-hole-${hole}`}
              >
                Hole {hole}
                {hole === currentHole && (
                  <span className="ml-2 text-xs opacity-70">(current)</span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

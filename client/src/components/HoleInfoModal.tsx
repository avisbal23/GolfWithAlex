import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface HoleInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  holeNumber: number;
  onSubmit: (par: number | null, yardage: number | null) => void;
  initialPar?: number | null;
  initialYardage?: number | null;
}

export function HoleInfoModal({
  isOpen,
  onClose,
  holeNumber,
  onSubmit,
  initialPar,
  initialYardage,
}: HoleInfoModalProps) {
  const [par, setPar] = useState<string>(initialPar?.toString() || '');
  const [yardage, setYardage] = useState<string>(initialYardage?.toString() || '');

  useEffect(() => {
    if (isOpen) {
      setPar(initialPar?.toString() || '');
      setYardage(initialYardage?.toString() || '');
    }
  }, [isOpen, initialPar, initialYardage]);

  const handleParChange = (value: string) => {
    const num = parseInt(value, 10);
    if (value === '' || (num >= 1 && num <= 9)) {
      setPar(value);
    }
  };

  const handleYardageChange = (value: string) => {
    const num = parseInt(value, 10);
    if (value === '' || (num >= 1 && num <= 999)) {
      setYardage(value);
    }
  };

  const handleSubmit = () => {
    const parNum = par ? parseInt(par, 10) : null;
    const yardageNum = yardage ? parseInt(yardage, 10) : null;
    onSubmit(parNum, yardageNum);
    onClose();
  };

  const handleSkip = () => {
    onSubmit(null, null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-sm" data-testid="dialog-hole-info">
        <DialogHeader>
          <DialogTitle data-testid="text-hole-info-title">
            Hole {holeNumber}
          </DialogTitle>
          <DialogDescription>
            Enter the par and yardage for this hole (optional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="par-input" className="text-sm font-medium">
              Par
            </Label>
            <Input
              id="par-input"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={9}
              value={par}
              onChange={(e) => handleParChange(e.target.value)}
              placeholder="3, 4, or 5"
              className="h-10 text-center text-lg"
              autoFocus
              data-testid="input-hole-par"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yardage-input" className="text-sm font-medium">
              Yardage (optional)
            </Label>
            <Input
              id="yardage-input"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={999}
              value={yardage}
              onChange={(e) => handleYardageChange(e.target.value)}
              placeholder="e.g., 425"
              className="h-10 text-center text-lg"
              data-testid="input-hole-yardage"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSkip}
            data-testid="button-skip-hole-info"
          >
            Skip
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            data-testid="button-confirm-hole-info"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

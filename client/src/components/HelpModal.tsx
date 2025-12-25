import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            How to use GolfWithAlex
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-base">
          <ol className="list-decimal list-inside space-y-3 text-foreground/90">
            <li>Enter player names (1-4)</li>
            <li>Tap a player to add a stroke</li>
            <li>Tap and hold to remove a stroke</li>
            <li>Swipe right or tap "Finish Hole" to continue</li>
            <li>Swipe left to go back to a hole</li>
            <li>Hole 9 and 18 show subtotals and totals</li>
            <li>At the end, export your scorecard to share on socials</li>
          </ol>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Score Colors</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded score-birdie" />
                <span>Birdie (-1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded score-par" />
                <span>Par (0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded score-bogey" />
                <span>Bogey (+1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded score-double" />
                <span>Double (+2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded score-triple" />
                <span>+3 or worse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded score-neutral border border-border" />
                <span>No par set</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          onClick={onClose}
          data-testid="button-close-help"
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Player } from '@/lib/types';

interface ExportSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onExport: (selectedPlayerIds: string[]) => void;
}

export function ExportSelectModal({
  isOpen,
  onClose,
  players,
  onExport,
}: ExportSelectModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(players.map(p => p.id));

  const togglePlayer = (playerId: string) => {
    setSelectedIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleExport = () => {
    if (selectedIds.length > 0) {
      onExport(selectedIds);
      onClose();
    }
  };

  const selectAll = () => {
    setSelectedIds(players.map(p => p.id));
  };

  const selectNone = () => {
    setSelectedIds([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-export-select">
        <DialogHeader>
          <DialogTitle data-testid="text-export-select-title">
            Select Players to Include
          </DialogTitle>
          <DialogDescription>
            Choose which players to include in the exported scorecard image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              data-testid="button-select-all"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectNone}
              data-testid="button-select-none"
            >
              Select None
            </Button>
          </div>

          <div className="space-y-2">
            {players.map((player, index) => (
              <label
                key={player.id}
                className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                data-testid={`label-player-select-${index}`}
              >
                <Checkbox
                  checked={selectedIds.includes(player.id)}
                  onCheckedChange={() => togglePlayer(player.id)}
                  data-testid={`checkbox-player-${index}`}
                />
                <span className="text-sm font-medium">{player.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleExport}
            disabled={selectedIds.length === 0}
            data-testid="button-confirm-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Export ({selectedIds.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

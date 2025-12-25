import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Player, PlayerScores } from '@/lib/types';

interface SubtotalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'front9' | 'round';
  players: Player[];
  scores: PlayerScores;
}

export function SubtotalModal({
  isOpen,
  onClose,
  type,
  players,
  scores,
}: SubtotalModalProps) {
  const getFront9Total = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    let total = 0;
    for (let i = 0; i < Math.min(9, playerScores.length); i++) {
      total += playerScores[i]?.strokes || 0;
    }
    return total;
  };

  const getBack9Total = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    let total = 0;
    for (let i = 9; i < Math.min(18, playerScores.length); i++) {
      total += playerScores[i]?.strokes || 0;
    }
    return total;
  };

  const getTotalScore = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    return playerScores.reduce((sum, s) => sum + (s?.strokes || 0), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {type === 'front9' ? 'Front 9 Complete!' : 'Round Complete!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b" data-testid="subtotal-row-header">
                <th className="p-2 text-left font-medium" data-testid="subtotal-header-player">Player</th>
                {type === 'round' && (
                  <>
                    <th className="p-2 text-center font-medium" data-testid="subtotal-header-front9">F9</th>
                    <th className="p-2 text-center font-medium" data-testid="subtotal-header-back9">B9</th>
                  </>
                )}
                <th className="p-2 text-center font-medium" data-testid="subtotal-header-total">
                  {type === 'front9' ? 'Front 9' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className="border-b" data-testid={`subtotal-row-player-${index}`}>
                  <td className="p-2 font-medium truncate max-w-[120px]" data-testid={`subtotal-text-name-${index}`}>
                    {player.name}
                  </td>
                  {type === 'round' && (
                    <>
                      <td className="p-2 text-center tabular-nums" data-testid={`subtotal-text-front9-${index}`}>
                        {getFront9Total(player.id)}
                      </td>
                      <td className="p-2 text-center tabular-nums" data-testid={`subtotal-text-back9-${index}`}>
                        {getBack9Total(player.id)}
                      </td>
                    </>
                  )}
                  <td className="p-2 text-center font-bold text-lg tabular-nums" data-testid={`subtotal-text-total-${index}`}>
                    {type === 'front9' 
                      ? getFront9Total(player.id) 
                      : getTotalScore(player.id)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          className="w-full"
          onClick={onClose}
          data-testid="button-close-subtotal"
        >
          {type === 'front9' ? 'Continue to Back 9' : 'View Scorecard'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Player, PlayerScores, getScoreColorClass } from '@/lib/types';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  scores: PlayerScores;
  currentHole: number;
  totalHoles: number;
  currentHoleStrokes: { [playerId: string]: number };
  currentHolePar: number | null;
}

export function ScoreModal({
  isOpen,
  onClose,
  players,
  scores,
  currentHole,
  totalHoles,
  currentHoleStrokes,
  currentHolePar,
}: ScoreModalProps) {
  const holes = Array.from({ length: totalHoles }, (_, i) => i + 1);

  const getHoleScore = (playerId: string, hole: number) => {
    if (hole === currentHole) {
      return {
        strokes: currentHoleStrokes[playerId] || 0,
        par: currentHolePar,
      };
    }
    
    const playerScores = scores[playerId] || [];
    return playerScores[hole - 1] || null;
  };

  const getFront9Total = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    let total = 0;
    
    for (let i = 0; i < Math.min(9, playerScores.length); i++) {
      total += playerScores[i]?.strokes || 0;
    }
    
    if (currentHole <= 9) {
      total += currentHoleStrokes[playerId] || 0;
    }
    
    return total;
  };

  const getBack9Total = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    let total = 0;
    
    for (let i = 9; i < Math.min(18, playerScores.length); i++) {
      total += playerScores[i]?.strokes || 0;
    }
    
    if (currentHole > 9 && currentHole <= 18) {
      total += currentHoleStrokes[playerId] || 0;
    }
    
    return total;
  };

  const getPlayerTotal = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    let total = playerScores.reduce((sum, s) => sum + (s?.strokes || 0), 0);
    
    if (currentHole <= totalHoles) {
      total += currentHoleStrokes[playerId] || 0;
    }
    
    return total;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]" data-testid="dialog-score">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" data-testid="text-score-title">
            Current Scorecard
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b" data-testid="modal-row-header">
                <th className="p-2 text-center font-medium min-w-[40px]" data-testid="modal-header-hole">
                  Hole
                </th>
                {players.map((player, playerIndex) => (
                  <th
                    key={player.id}
                    className="p-2 text-center font-medium truncate max-w-[80px]"
                    data-testid={`modal-header-player-${playerIndex}`}
                  >
                    {player.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holes.map((hole) => (
                <tr
                  key={hole}
                  className={`border-b ${hole === currentHole ? 'bg-primary/5' : ''}`}
                  data-testid={`modal-row-hole-${hole}`}
                >
                  <td
                    className={`p-2 text-center font-medium ${hole === currentHole ? 'bg-primary/10' : ''}`}
                    data-testid={`modal-text-hole-${hole}`}
                  >
                    {hole}
                  </td>
                  {players.map((player, playerIndex) => {
                    const score = getHoleScore(player.id, hole);
                    const colorClass = score && score.strokes > 0 
                      ? getScoreColorClass(score.strokes, score.par)
                      : '';
                    
                    return (
                      <td
                        key={player.id}
                        className={`p-2 text-center ${colorClass ? colorClass + ' rounded-sm' : ''}`}
                        data-testid={`modal-cell-score-${playerIndex}-${hole}`}
                      >
                        {score && score.strokes > 0 ? score.strokes : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {totalHoles === 18 && (
                <>
                  <tr className="border-b border-t-2" data-testid="modal-row-front9">
                    <td className="p-2 text-center font-medium" data-testid="modal-label-front9">
                      Front 9
                    </td>
                    {players.map((player, playerIndex) => (
                      <td
                        key={player.id}
                        className="p-2 text-center font-medium"
                        data-testid={`modal-text-front9-${playerIndex}`}
                      >
                        {getFront9Total(player.id) || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b" data-testid="modal-row-back9">
                    <td className="p-2 text-center font-medium" data-testid="modal-label-back9">
                      Back 9
                    </td>
                    {players.map((player, playerIndex) => (
                      <td
                        key={player.id}
                        className="p-2 text-center font-medium"
                        data-testid={`modal-text-back9-${playerIndex}`}
                      >
                        {getBack9Total(player.id) || '-'}
                      </td>
                    ))}
                  </tr>
                </>
              )}
              <tr className="border-t-2" data-testid="modal-row-total">
                <td className="p-2 text-center font-bold" data-testid="modal-label-total">
                  Total
                </td>
                {players.map((player, playerIndex) => (
                  <td
                    key={player.id}
                    className="p-2 text-center font-bold"
                    data-testid={`modal-text-total-${playerIndex}`}
                  >
                    {getPlayerTotal(player.id) || '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </ScrollArea>

        <Button
          className="w-full mt-2"
          onClick={onClose}
          data-testid="button-close-score"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

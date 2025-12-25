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

  const getPlayerTotal = (playerId: string): number => {
    const playerScores = scores[playerId] || [];
    let total = playerScores.reduce((sum, s) => sum + (s?.strokes || 0), 0);
    
    // Add current hole strokes if on current hole
    if (currentHole <= totalHoles) {
      total += currentHoleStrokes[playerId] || 0;
    }
    
    return total;
  };

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
    
    // Include current hole if within front 9
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
    
    // Include current hole if within back 9
    if (currentHole > 9 && currentHole <= 18) {
      total += currentHoleStrokes[playerId] || 0;
    }
    
    return total;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Current Score
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b" data-testid="modal-row-header">
                  <th className="sticky left-0 bg-background p-2 text-left font-medium min-w-[80px]" data-testid="modal-header-player">
                    Player
                  </th>
                  {holes.map((hole) => (
                    <th
                      key={hole}
                      className={`p-2 text-center font-medium min-w-[36px] ${
                        hole === currentHole ? 'bg-primary/10' : ''
                      }`}
                      data-testid={`modal-header-hole-${hole}`}
                    >
                      {hole}
                    </th>
                  ))}
                  {totalHoles === 18 && (
                    <>
                      <th className="p-2 text-center font-medium min-w-[40px] border-l-2" data-testid="modal-header-front9">
                        F9
                      </th>
                      <th className="p-2 text-center font-medium min-w-[40px]" data-testid="modal-header-back9">
                        B9
                      </th>
                    </>
                  )}
                  <th className="p-2 text-center font-medium min-w-[44px] border-l-2" data-testid="modal-header-total">
                    Tot
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, playerIndex) => (
                  <tr key={player.id} className="border-b" data-testid={`modal-row-player-${playerIndex}`}>
                    <td className="sticky left-0 bg-background p-2 font-medium truncate max-w-[100px]" data-testid={`modal-text-player-name-${playerIndex}`}>
                      {player.name}
                    </td>
                    {holes.map((hole) => {
                      const score = getHoleScore(player.id, hole);
                      const colorClass = score && score.strokes > 0 
                        ? getScoreColorClass(score.strokes, score.par)
                        : '';
                      
                      return (
                        <td
                          key={hole}
                          className={`p-2 text-center ${
                            hole === currentHole ? 'bg-primary/5' : ''
                          } ${colorClass ? colorClass + ' rounded-sm' : ''}`}
                          data-testid={`modal-cell-score-${playerIndex}-${hole}`}
                        >
                          {score && score.strokes > 0 ? score.strokes : '-'}
                        </td>
                      );
                    })}
                    {totalHoles === 18 && (
                      <>
                        <td className="p-2 text-center font-medium border-l-2" data-testid={`modal-text-front9-${playerIndex}`}>
                          {getFront9Total(player.id) || '-'}
                        </td>
                        <td className="p-2 text-center font-medium" data-testid={`modal-text-back9-${playerIndex}`}>
                          {getBack9Total(player.id) || '-'}
                        </td>
                      </>
                    )}
                    <td className="p-2 text-center font-bold border-l-2" data-testid={`modal-text-total-${playerIndex}`}>
                      {getPlayerTotal(player.id) || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

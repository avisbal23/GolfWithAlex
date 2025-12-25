import { useRef, useCallback } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Player, PlayerScores, RoundSetup, getScoreColorClass } from '@/lib/types';

interface ScorecardProps {
  players: Player[];
  scores: PlayerScores;
  setup: RoundSetup;
  onNewRound: () => void;
  onExportPng: () => void;
  selectedPlayerIds?: string[];
}

export function Scorecard({
  players,
  scores,
  setup,
  onNewRound,
  onExportPng,
  selectedPlayerIds,
}: ScorecardProps) {
  const holes = Array.from({ length: setup.holeCount }, (_, i) => i + 1);
  
  // Filter players based on selection (for export), default to all
  const displayPlayers = selectedPlayerIds 
    ? players.filter(p => selectedPlayerIds.includes(p.id))
    : players;

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

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <Card className="p-4" id="scorecard-export">
        <div className="text-center space-y-1 pb-4 border-b mb-4">
          <h2 className="text-xl font-bold" data-testid="text-course-name">
            {setup.courseName || 'Golf Round'}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-round-details">
            {[setup.tees, formatDate(setup.date), setup.location]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <ScrollArea className="w-full">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b" data-testid="row-header">
                <th className="p-2 text-center font-medium min-w-[40px]" data-testid="header-hole">
                  Hole
                </th>
                {displayPlayers.map((player, playerIndex) => (
                  <th
                    key={player.id}
                    className="p-2 text-center font-medium truncate max-w-[80px]"
                    data-testid={`header-player-${playerIndex}`}
                  >
                    {player.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holes.map((hole) => (
                <tr key={hole} className="border-b" data-testid={`row-hole-${hole}`}>
                  <td className="p-2 text-center font-medium" data-testid={`text-hole-${hole}`}>
                    {hole}
                  </td>
                  {displayPlayers.map((player, playerIndex) => {
                    const playerScores = scores[player.id] || [];
                    const score = playerScores[hole - 1];
                    const colorClass = score && score.strokes > 0
                      ? getScoreColorClass(score.strokes, score.par)
                      : '';

                    return (
                      <td
                        key={player.id}
                        className={`p-2 text-center ${colorClass ? colorClass + ' rounded-sm' : ''}`}
                        data-testid={`cell-score-${playerIndex}-${hole}`}
                      >
                        {score?.strokes || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {setup.holeCount === 18 && (
                <tr className="border-b border-t-2" data-testid="row-front9">
                  <td className="p-2 text-center font-medium" data-testid="label-front9">
                    Front 9
                  </td>
                  {displayPlayers.map((player, playerIndex) => (
                    <td
                      key={player.id}
                      className="p-2 text-center font-medium"
                      data-testid={`text-front9-${playerIndex}`}
                    >
                      {getFront9Total(player.id)}
                    </td>
                  ))}
                </tr>
              )}
              {setup.holeCount === 18 && (
                <tr className="border-b" data-testid="row-back9">
                  <td className="p-2 text-center font-medium" data-testid="label-back9">
                    Back 9
                  </td>
                  {displayPlayers.map((player, playerIndex) => (
                    <td
                      key={player.id}
                      className="p-2 text-center font-medium"
                      data-testid={`text-back9-${playerIndex}`}
                    >
                      {getBack9Total(player.id)}
                    </td>
                  ))}
                </tr>
              )}
              <tr className="border-t-2" data-testid="row-total">
                <td className="p-2 text-center font-bold" data-testid="label-total">
                  Total
                </td>
                {displayPlayers.map((player, playerIndex) => (
                  <td
                    key={player.id}
                    className="p-2 text-center font-bold"
                    data-testid={`text-total-${playerIndex}`}
                  >
                    {getTotalScore(player.id)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </ScrollArea>

        <div className="pt-4 mt-4 border-t flex items-center justify-between text-xs text-muted-foreground" data-testid="container-watermark">
          <span data-testid="text-app-name">GolfWithAlex</span>
          <a
            href="https://golfwithalex.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            data-testid="link-watermark"
          >
            golfwithalex.me
          </a>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onNewRound}
          data-testid="button-new-round"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Round
        </Button>
        <Button
          className="flex-1"
          onClick={onExportPng}
          data-testid="button-save-png"
        >
          <Download className="w-4 h-4 mr-2" />
          Save PNG
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { MapPin, Flag, Users, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoundSetup, Player, TEES_OPTIONS, generatePlayerId } from '@/lib/types';

interface PreRoundSetupProps {
  setup: RoundSetup;
  players: Player[];
  currentHole: number;
  hasStarted: boolean;
  onSetupChange: (setup: RoundSetup) => void;
  onPlayersChange: (players: Player[]) => void;
  onStart: () => void;
  onNewRound: () => void;
}

export function PreRoundSetup({
  setup,
  players,
  currentHole,
  hasStarted,
  onSetupChange,
  onPlayersChange,
  onStart,
  onNewRound,
}: PreRoundSetupProps) {
  const [isExpanded, setIsExpanded] = useState(!hasStarted);

  useEffect(() => {
    if (hasStarted) {
      setIsExpanded(false);
    }
  }, [hasStarted]);

  useEffect(() => {
    if (currentHole > 1 && isExpanded) {
      setIsExpanded(false);
    }
  }, [currentHole]);

  const updateSetup = (updates: Partial<RoundSetup>) => {
    onSetupChange({ ...setup, ...updates });
  };

  const addPlayer = () => {
    if (players.length >= 4) return;
    const newPlayer: Player = {
      id: generatePlayerId(),
      name: `Player ${players.length + 1}`,
    };
    onPlayersChange([...players, newPlayer]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 1) return;
    onPlayersChange(players.filter((p) => p.id !== id));
  };

  const updatePlayerName = (id: string, name: string) => {
    onPlayersChange(
      players.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  // Show collapsed view only after round has started and not expanded
  if (hasStarted && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-4 py-2 flex items-center justify-between gap-2 bg-muted/50 border-b text-sm hover-elevate active-elevate-2"
        data-testid="button-expand-setup"
      >
        <span className="flex items-center gap-2 text-muted-foreground truncate" data-testid="text-setup-summary">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate" data-testid="text-course-summary">
            {setup.courseName || setup.location || 'Tap to edit round details'}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="px-3 py-2 bg-muted/30 border-b space-y-2">
      {hasStarted && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Round Details</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(false)}
            data-testid="button-collapse-setup"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="location" className="text-xs text-muted-foreground">Location</Label>
          <Input
            id="location"
            type="text"
            placeholder="City"
            value={setup.location}
            onChange={(e) => updateSetup({ location: e.target.value })}
            className="h-8 text-sm"
            data-testid="input-location"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="courseName" className="text-xs text-muted-foreground">Course</Label>
          <Input
            id="courseName"
            type="text"
            placeholder="Course name"
            value={setup.courseName}
            onChange={(e) => updateSetup({ courseName: e.target.value })}
            className="h-8 text-sm"
            data-testid="input-course-name"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="tees" className="text-xs text-muted-foreground">Tees</Label>
          <Select value={setup.tees} onValueChange={(val) => updateSetup({ tees: val })}>
            <SelectTrigger className="h-8 text-sm" data-testid="select-tees">
              <SelectValue placeholder="Tees" />
            </SelectTrigger>
            <SelectContent data-testid="select-tees-content">
              {TEES_OPTIONS.map((tee, index) => (
                <SelectItem key={tee} value={tee} data-testid={`select-tee-option-${index}`}>
                  {tee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Holes</Label>
          <div className="flex gap-1" data-testid="container-round-length">
            <Button
              variant={setup.holeCount === 9 ? 'default' : 'outline'}
              size="sm"
              className="flex-1 h-8"
              onClick={() => updateSetup({ holeCount: 9 })}
              data-testid="button-9-holes"
            >
              9
            </Button>
            <Button
              variant={setup.holeCount === 18 ? 'default' : 'outline'}
              size="sm"
              className="flex-1 h-8"
              onClick={() => updateSetup({ holeCount: 18 })}
              data-testid="button-18-holes"
            >
              18
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Players ({players.length}/4)
          </Label>
          {players.length < 4 && (
            <Button size="sm" variant="ghost" onClick={addPlayer} data-testid="button-add-player">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>

        <div className="grid gap-1" data-testid="container-players">
          {players.map((player, index) => (
            <div key={player.id} className="flex items-center gap-1" data-testid={`row-player-input-${index}`}>
              <Input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="h-8 text-sm flex-1"
                data-testid={`input-player-name-${index}`}
                aria-label={`Player ${index + 1} name`}
              />
              {players.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removePlayer(player.id)}
                  className="shrink-0 text-muted-foreground h-8 w-8"
                  data-testid={`button-remove-player-${index}`}
                  aria-label={`Remove player ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {!hasStarted && (
        <Button className="w-full" onClick={onStart} data-testid="button-start-round">
          Start Round
        </Button>
      )}

      {hasStarted && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onNewRound}
          data-testid="button-new-round-dropdown"
        >
          Start New Round
        </Button>
      )}
    </div>
  );
}

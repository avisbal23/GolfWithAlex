export interface Player {
  id: string;
  name: string;
}

export interface HoleScore {
  strokes: number;
  par: number | null;
  yardage?: number | null;
}

export interface PlayerScores {
  [playerId: string]: HoleScore[];
}

export interface RoundSetup {
  location: string;
  courseName: string;
  tees: string;
  date: string;
  holeCount: 9 | 18;
}

export interface GameState {
  players: Player[];
  currentHole: number;
  scores: PlayerScores;
  roundSetup: RoundSetup;
  isRoundComplete: boolean;
  hasStarted: boolean;
  currentHoleStrokes: { [playerId: string]: number };
  currentHolePar: number | null;
  currentHoleYardage: number | null;
  holeYardages: { [hole: number]: number | null };
}

export type ScoreType = 'birdie' | 'par' | 'bogey' | 'double' | 'triple' | 'neutral';

export function getScoreType(strokes: number, par: number | null): ScoreType {
  if (par === null || par === 0) return 'neutral';
  
  const diff = strokes - par;
  
  if (diff === 0) return 'par';
  if (diff === -1) return 'birdie';
  if (diff === 1) return 'bogey';
  if (diff === 2) return 'double';
  if (diff >= 3) return 'triple';
  if (diff <= -2) return 'birdie'; // Eagle or better treated as birdie color
  
  return 'neutral';
}

export function getScoreColorClass(strokes: number, par: number | null): string {
  const type = getScoreType(strokes, par);
  return `score-${type}`;
}

export function getScoreBorderClass(strokes: number, par: number | null): string {
  const type = getScoreType(strokes, par);
  return `score-${type}-border`;
}

export const TEES_OPTIONS = ['Tips', 'Blue', 'White', 'Red', 'Custom'];

export const DEFAULT_ROUND_SETUP: RoundSetup = {
  location: '',
  courseName: '',
  tees: 'White',
  date: new Date().toISOString().split('T')[0],
  holeCount: 18,
};

export function createInitialGameState(): GameState {
  return {
    players: [{ id: '1', name: 'Player 1' }],
    currentHole: 1,
    scores: {},
    roundSetup: { ...DEFAULT_ROUND_SETUP },
    isRoundComplete: false,
    hasStarted: false,
    currentHoleStrokes: {},
    currentHolePar: null,
    currentHoleYardage: null,
    holeYardages: {},
  };
}

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 9);
}

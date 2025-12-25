import { GameState, createInitialGameState } from './types';

const STORAGE_KEY = 'golfwithalex_game';
const THEME_KEY = 'golfwithalex_theme';

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

export function loadGameState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (e) {
    console.error('Failed to load game state:', e);
  }
  return null;
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear game state:', e);
  }
}

export function getOrCreateGameState(): GameState {
  const saved = loadGameState();
  if (saved) {
    // Migrate old game states that might be missing new fields
    const initial = createInitialGameState();
    const migrated: GameState = {
      ...initial,
      ...saved,
      roundSetup: {
        ...initial.roundSetup,
        ...saved.roundSetup,
      },
      // Ensure hasStarted has a boolean value (for old saves without it)
      hasStarted: saved.hasStarted ?? false,
    };
    return migrated;
  }
  const initial = createInitialGameState();
  saveGameState(initial);
  return initial;
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to load theme:', e);
  }
  return 'light';
}

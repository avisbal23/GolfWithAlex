import { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '@/components/TopBar';
import { PreRoundSetup } from '@/components/PreRoundSetup';
import { PlayerTile } from '@/components/PlayerTile';
import { BottomControls } from '@/components/BottomControls';
import { HelpModal } from '@/components/HelpModal';
import { ScoreModal } from '@/components/ScoreModal';
import { SubtotalModal } from '@/components/SubtotalModal';
import { Scorecard } from '@/components/Scorecard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  GameState,
  Player,
  RoundSetup,
  HoleScore,
  createInitialGameState,
} from '@/lib/types';
import { saveGameState, getOrCreateGameState, clearGameState } from '@/lib/storage';

const SWIPE_THRESHOLD = 50;

export function GolfApp() {
  const [gameState, setGameState] = useState<GameState>(getOrCreateGameState);
  const [showHelp, setShowHelp] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showSubtotal, setShowSubtotal] = useState<'front9' | 'round' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const scoringAreaRef = useRef<HTMLDivElement>(null);

  // Save state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSetupChange = useCallback((setup: RoundSetup) => {
    updateGameState({ roundSetup: setup });
  }, [updateGameState]);

  const handlePlayersChange = useCallback((players: Player[]) => {
    // Initialize stroke counters for new players
    const currentHoleStrokes = { ...gameState.currentHoleStrokes };
    players.forEach((p) => {
      if (!(p.id in currentHoleStrokes)) {
        currentHoleStrokes[p.id] = 0;
      }
    });
    
    // Remove strokes for removed players
    Object.keys(currentHoleStrokes).forEach((id) => {
      if (!players.find((p) => p.id === id)) {
        delete currentHoleStrokes[id];
      }
    });

    updateGameState({ players, currentHoleStrokes });
  }, [gameState.currentHoleStrokes, updateGameState]);

  const handleIncrement = useCallback((playerId: string) => {
    setHasInteracted(true);
    setGameState((prev) => ({
      ...prev,
      currentHoleStrokes: {
        ...prev.currentHoleStrokes,
        [playerId]: (prev.currentHoleStrokes[playerId] || 0) + 1,
      },
    }));
  }, []);

  const handleDecrement = useCallback((playerId: string) => {
    setHasInteracted(true);
    setGameState((prev) => ({
      ...prev,
      currentHoleStrokes: {
        ...prev.currentHoleStrokes,
        [playerId]: Math.max(0, (prev.currentHoleStrokes[playerId] || 0) - 1),
      },
    }));
  }, []);

  const handleParChange = useCallback((par: number | null) => {
    updateGameState({ currentHolePar: par });
  }, [updateGameState]);

  const handleResetHole = useCallback(() => {
    const resetStrokes: { [playerId: string]: number } = {};
    gameState.players.forEach((player) => {
      resetStrokes[player.id] = 0;
    });
    updateGameState({ currentHoleStrokes: resetStrokes });
  }, [gameState.players, updateGameState]);

  const saveCurrentHoleScores = useCallback(() => {
    const { players, currentHole, scores, currentHoleStrokes, currentHolePar } = gameState;
    
    const newScores = { ...scores };
    
    players.forEach((player) => {
      if (!newScores[player.id]) {
        newScores[player.id] = [];
      }
      
      // Ensure array is long enough
      while (newScores[player.id].length < currentHole) {
        newScores[player.id].push({ strokes: 0, par: null });
      }
      
      newScores[player.id][currentHole - 1] = {
        strokes: currentHoleStrokes[player.id] || 0,
        par: currentHolePar,
      };
    });

    return newScores;
  }, [gameState]);

  const loadHoleScores = useCallback((hole: number) => {
    const { players, scores } = gameState;
    
    const currentHoleStrokes: { [playerId: string]: number } = {};
    let currentHolePar: number | null = null;
    
    players.forEach((player) => {
      const playerScores = scores[player.id] || [];
      const holeScore = playerScores[hole - 1];
      
      if (holeScore) {
        currentHoleStrokes[player.id] = holeScore.strokes;
        if (holeScore.par !== null) {
          currentHolePar = holeScore.par;
        }
      } else {
        currentHoleStrokes[player.id] = 0;
      }
    });

    return { currentHoleStrokes, currentHolePar };
  }, [gameState]);

  const handleFinishHole = useCallback(() => {
    const { currentHole, roundSetup } = gameState;
    const totalHoles = roundSetup.holeCount;
    
    // Save current hole scores
    const newScores = saveCurrentHoleScores();
    
    if (currentHole === 9 && totalHoles === 18) {
      // Show front 9 subtotal
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        currentHole: 10,
        currentHoleStrokes: Object.fromEntries(
          prev.players.map((p) => [p.id, 0])
        ),
        currentHolePar: null,
      }));
      setShowSubtotal('front9');
    } else if (currentHole === totalHoles) {
      // Round complete
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        isRoundComplete: true,
      }));
      setShowSubtotal('round');
    } else {
      // Move to next hole
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        currentHole: currentHole + 1,
        currentHoleStrokes: Object.fromEntries(
          prev.players.map((p) => [p.id, 0])
        ),
        currentHolePar: null,
      }));
    }
  }, [gameState, saveCurrentHoleScores]);

  const handlePreviousHole = useCallback(() => {
    const { currentHole } = gameState;
    
    if (currentHole <= 1) return;
    
    // Save current hole scores first
    const newScores = saveCurrentHoleScores();
    
    // Load previous hole scores
    const prevHole = currentHole - 1;
    const { currentHoleStrokes, currentHolePar } = loadHoleScores(prevHole);
    
    setGameState((prev) => ({
      ...prev,
      scores: newScores,
      currentHole: prevHole,
      currentHoleStrokes,
      currentHolePar,
    }));
  }, [gameState, saveCurrentHoleScores, loadHoleScores]);

  const handleNextHole = useCallback(() => {
    const { currentHole, roundSetup } = gameState;
    
    if (currentHole >= roundSetup.holeCount) return;
    
    handleFinishHole();
  }, [gameState, handleFinishHole]);

  // Swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only process horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Swipe right - go back to previous hole
        handlePreviousHole();
      } else {
        // Swipe left - advance to next hole
        handleFinishHole();
      }
    }
    
    touchStartRef.current = null;
  }, [handlePreviousHole, handleFinishHole]);

  const handleStartRound = useCallback(() => {
    updateGameState({ hasStarted: true });
  }, [updateGameState]);

  const handleNewRound = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const confirmNewRound = useCallback(() => {
    clearGameState();
    setGameState(createInitialGameState());
    setShowResetConfirm(false);
    setHasInteracted(false);
  }, []);

  const handleExportPng = useCallback(async () => {
    const element = document.getElementById('scorecard-export');
    if (!element) return;

    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });

      // Convert to blob and trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `golf-scorecard-${gameState.roundSetup.date}.png`;
        link.href = url;
        
        // For iOS, try to use share API if available
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'scorecard.png', { type: 'image/png' })] })) {
          const file = new File([blob], 'scorecard.png', { type: 'image/png' });
          navigator.share({
            files: [file],
            title: 'Golf Scorecard',
          }).catch(() => {
            // Fallback to download
            link.click();
          });
        } else {
          link.click();
        }
        
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to export PNG:', error);
    }
  }, [gameState.roundSetup.date]);

  // Get grid layout based on player count
  const getGridClass = () => {
    switch (gameState.players.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1';
    }
  };

  // Show scorecard when round is complete
  if (gameState.isRoundComplete && !showSubtotal) {
    return (
      <div className="flex flex-col h-screen max-h-screen bg-background">
        <TopBar
          onHelpClick={() => setShowHelp(true)}
          onViewScoreClick={() => setShowScore(true)}
        />
        
        <main className="flex-1 overflow-auto">
          <Scorecard
            players={gameState.players}
            scores={gameState.scores}
            setup={gameState.roundSetup}
            onNewRound={handleNewRound}
            onExportPng={handleExportPng}
          />
        </main>

        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        
        <ScoreModal
          isOpen={showScore}
          onClose={() => setShowScore(false)}
          players={gameState.players}
          scores={gameState.scores}
          currentHole={gameState.currentHole}
          totalHoles={gameState.roundSetup.holeCount}
          currentHoleStrokes={gameState.currentHoleStrokes}
          currentHolePar={gameState.currentHolePar}
        />

        <ConfirmDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={confirmNewRound}
          title="Start New Round?"
          description="This will clear all current scores and start a fresh round. This action cannot be undone."
          confirmText="New Round"
          cancelText="Cancel"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background overflow-hidden">
      <TopBar
        onHelpClick={() => setShowHelp(true)}
        onViewScoreClick={() => setShowScore(true)}
      />

      <PreRoundSetup
        setup={gameState.roundSetup}
        players={gameState.players}
        currentHole={gameState.currentHole}
        hasStarted={gameState.hasStarted}
        onSetupChange={handleSetupChange}
        onPlayersChange={handlePlayersChange}
        onStart={handleStartRound}
      />

      {gameState.hasStarted && (
        <>
          <main
            ref={scoringAreaRef}
            className="flex-1 p-4 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            data-testid="scoring-area"
          >
            <div className={`grid ${getGridClass()} gap-4 h-full`}>
              {gameState.players.map((player, index) => (
                <PlayerTile
                  key={player.id}
                  name={player.name}
                  strokes={gameState.currentHoleStrokes[player.id] || 0}
                  par={gameState.currentHolePar}
                  showHint={!hasInteracted && index === 0}
                  onIncrement={() => handleIncrement(player.id)}
                  onDecrement={() => handleDecrement(player.id)}
                  testId={`tile-player-${index}`}
                />
              ))}
            </div>
          </main>

          <BottomControls
            currentHole={gameState.currentHole}
            totalHoles={gameState.roundSetup.holeCount}
            par={gameState.currentHolePar}
            onParChange={handleParChange}
            onFinishHole={handleFinishHole}
            onResetHole={handleResetHole}
            isLastHole={gameState.currentHole === gameState.roundSetup.holeCount}
          />
        </>
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      <ScoreModal
        isOpen={showScore}
        onClose={() => setShowScore(false)}
        players={gameState.players}
        scores={gameState.scores}
        currentHole={gameState.currentHole}
        totalHoles={gameState.roundSetup.holeCount}
        currentHoleStrokes={gameState.currentHoleStrokes}
        currentHolePar={gameState.currentHolePar}
      />

      <SubtotalModal
        isOpen={showSubtotal !== null}
        onClose={() => setShowSubtotal(null)}
        type={showSubtotal || 'front9'}
        players={gameState.players}
        scores={gameState.scores}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmNewRound}
        title="Start New Round?"
        description="This will clear all current scores and start a fresh round. This action cannot be undone."
        confirmText="New Round"
        cancelText="Cancel"
      />
    </div>
  );
}

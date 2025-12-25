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
import { BirdieCelebration } from '@/components/BirdieCelebration';
import { ExportSelectModal } from '@/components/ExportSelectModal';
import { HoleInfoModal } from '@/components/HoleInfoModal';
import { HoleJumpModal } from '@/components/HoleJumpModal';
import { ProfilePage } from './ProfilePage';
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
  const [showBirdieCelebration, setShowBirdieCelebration] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExportSelect, setShowExportSelect] = useState(false);
  const [exportPlayerIds, setExportPlayerIds] = useState<string[]>([]);
  const [showHoleInfo, setShowHoleInfo] = useState(false);
  const [pendingNextHole, setPendingNextHole] = useState<number | null>(null);
  const [showHoleJump, setShowHoleJump] = useState(false);

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
    const { players, scores, holeYardages } = gameState;
    
    const currentHoleStrokes: { [playerId: string]: number } = {};
    let currentHolePar: number | null = null;
    const currentHoleYardage = holeYardages[hole] || null;
    
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

    return { currentHoleStrokes, currentHolePar, currentHoleYardage };
  }, [gameState]);

  const handleFinishHole = useCallback(() => {
    const { currentHole, roundSetup, players, currentHoleStrokes, currentHolePar, currentHoleYardage, holeYardages } = gameState;
    const totalHoles = roundSetup.holeCount;
    
    // Check if any player got a birdie or better
    const hasBirdie = currentHolePar !== null && currentHolePar > 0 && 
      players.some((player) => {
        const strokes = currentHoleStrokes[player.id] || 0;
        return strokes > 0 && strokes < currentHolePar;
      });
    
    if (hasBirdie) {
      setShowBirdieCelebration(true);
    }
    
    // Save current hole scores
    const newScores = saveCurrentHoleScores();
    
    // Save yardage for current hole
    const newYardages = { ...holeYardages, [currentHole]: currentHoleYardage };
    
    if (currentHole === 9 && totalHoles === 18) {
      // Show front 9 subtotal, then prompt for hole 10 info
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        holeYardages: newYardages,
        currentHole: 10,
        currentHoleStrokes: Object.fromEntries(
          prev.players.map((p) => [p.id, 0])
        ),
        currentHolePar: null,
        currentHoleYardage: null,
      }));
      setShowSubtotal('front9');
      setPendingNextHole(10);
    } else if (currentHole === totalHoles) {
      // Round complete
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        holeYardages: newYardages,
        isRoundComplete: true,
      }));
      setShowSubtotal('round');
    } else {
      // Move to next hole and show hole info prompt
      const nextHole = currentHole + 1;
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        holeYardages: newYardages,
        currentHole: nextHole,
        currentHoleStrokes: Object.fromEntries(
          prev.players.map((p) => [p.id, 0])
        ),
        currentHolePar: null,
        currentHoleYardage: null,
      }));
      setPendingNextHole(nextHole);
      setShowHoleInfo(true);
    }
  }, [gameState, saveCurrentHoleScores]);

  const handleHoleInfoSubmit = useCallback((par: number | null, yardage: number | null) => {
    setGameState((prev) => ({
      ...prev,
      currentHolePar: par,
      currentHoleYardage: yardage,
    }));
    setPendingNextHole(null);
    setShowHoleInfo(false);
  }, []);

  const handleJumpToHole = useCallback((targetHole: number) => {
    const { currentHole, currentHoleYardage, holeYardages } = gameState;
    
    if (targetHole === currentHole) return;
    
    // Save current hole scores first
    const newScores = saveCurrentHoleScores();
    
    // Save current yardage
    const newYardages = { ...holeYardages, [currentHole]: currentHoleYardage };
    
    // Load target hole scores
    const { currentHoleStrokes, currentHolePar, currentHoleYardage: targetYardage } = loadHoleScores(targetHole);
    
    setGameState((prev) => ({
      ...prev,
      scores: newScores,
      holeYardages: newYardages,
      currentHole: targetHole,
      currentHoleStrokes,
      currentHolePar,
      currentHoleYardage: targetYardage,
    }));
  }, [gameState, saveCurrentHoleScores, loadHoleScores]);

  const handlePreviousHole = useCallback(() => {
    const { currentHole, currentHoleYardage, holeYardages } = gameState;
    
    if (currentHole <= 1) return;
    
    // Save current hole scores first
    const newScores = saveCurrentHoleScores();
    
    // Save current yardage
    const newYardages = { ...holeYardages, [currentHole]: currentHoleYardage };
    
    // Load previous hole scores
    const prevHole = currentHole - 1;
    const { currentHoleStrokes, currentHolePar, currentHoleYardage: prevYardage } = loadHoleScores(prevHole);
    
    setGameState((prev) => ({
      ...prev,
      scores: newScores,
      holeYardages: newYardages,
      currentHole: prevHole,
      currentHoleStrokes,
      currentHolePar,
      currentHoleYardage: prevYardage,
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

  const handleOpenExportSelect = useCallback(() => {
    setExportPlayerIds(gameState.players.map(p => p.id));
    setShowExportSelect(true);
  }, [gameState.players]);

  const handleExportPng = useCallback(async (selectedPlayerIds: string[]) => {
    // Set the selected player IDs so scorecard renders with only selected players
    setExportPlayerIds(selectedPlayerIds);
    setShowExportSelect(false);
    
    // Wait for the scorecard to re-render with selected players
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
        
        // Reset to show all players after export
        setExportPlayerIds([]);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to export PNG:', error);
      setExportPlayerIds([]);
    }
  }, [gameState.roundSetup.date]);

  // Find player with longest name for 3-player layout
  const getLongestNamePlayer = () => {
    if (gameState.players.length !== 3) return null;
    return gameState.players.reduce((longest, player) => 
      player.name.length > longest.name.length ? player : longest
    , gameState.players[0]);
  };

  // Render players based on count with custom layouts
  const renderPlayerGrid = () => {
    const players = gameState.players;
    const count = players.length;

    if (count === 1) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-3/4 max-w-[300px]">
            <PlayerTile
              key={players[0].id}
              name={players[0].name}
              strokes={gameState.currentHoleStrokes[players[0].id] || 0}
              par={gameState.currentHolePar}
              showHint={!hasInteracted}
              onIncrement={() => handleIncrement(players[0].id)}
              onDecrement={() => handleDecrement(players[0].id)}
              testId="tile-player-0"
              compact={true}
            />
          </div>
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="grid grid-cols-2 gap-3 w-full">
            {players.map((player, index) => (
              <PlayerTile
                key={player.id}
                name={player.name}
                strokes={gameState.currentHoleStrokes[player.id] || 0}
                par={gameState.currentHolePar}
                showHint={!hasInteracted && index === 0}
                onIncrement={() => handleIncrement(player.id)}
                onDecrement={() => handleDecrement(player.id)}
                testId={`tile-player-${index}`}
                compact={true}
              />
            ))}
          </div>
        </div>
      );
    }

    if (count === 3) {
      const longestNamePlayer = getLongestNamePlayer();
      const topPlayers = players.filter(p => p !== longestNamePlayer);
      const bottomPlayer = longestNamePlayer!;

      return (
        <div className="flex flex-col gap-3 h-full justify-center">
          <div className="grid grid-cols-2 gap-3">
            {topPlayers.map((player) => {
              const originalIndex = players.indexOf(player);
              return (
                <PlayerTile
                  key={player.id}
                  name={player.name}
                  strokes={gameState.currentHoleStrokes[player.id] || 0}
                  par={gameState.currentHolePar}
                  showHint={!hasInteracted && originalIndex === 0}
                  onIncrement={() => handleIncrement(player.id)}
                  onDecrement={() => handleDecrement(player.id)}
                  testId={`tile-player-${originalIndex}`}
                  compact={true}
                />
              );
            })}
          </div>
          <div className="flex justify-center">
            <div className="w-3/4">
              <PlayerTile
                key={bottomPlayer.id}
                name={bottomPlayer.name}
                strokes={gameState.currentHoleStrokes[bottomPlayer.id] || 0}
                par={gameState.currentHolePar}
                showHint={false}
                onIncrement={() => handleIncrement(bottomPlayer.id)}
                onDecrement={() => handleDecrement(bottomPlayer.id)}
                testId={`tile-player-${players.indexOf(bottomPlayer)}`}
                compact={true}
              />
            </div>
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full place-content-center">
          {players.map((player, index) => (
            <PlayerTile
              key={player.id}
              name={player.name}
              strokes={gameState.currentHoleStrokes[player.id] || 0}
              par={gameState.currentHolePar}
              showHint={!hasInteracted && index === 0}
              onIncrement={() => handleIncrement(player.id)}
              onDecrement={() => handleDecrement(player.id)}
              testId={`tile-player-${index}`}
              compact={true}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  // Show profile page
  if (showProfile) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

  // Show scorecard when round is complete
  if (gameState.isRoundComplete && !showSubtotal) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <TopBar
          onHelpClick={() => setShowHelp(true)}
          onViewScoreClick={() => setShowScore(true)}
          onProfileClick={() => setShowProfile(true)}
        />
        
        <main className="flex-1 min-h-0 overflow-auto">
          <Scorecard
            players={gameState.players}
            scores={gameState.scores}
            setup={gameState.roundSetup}
            onNewRound={handleNewRound}
            onExportPng={handleOpenExportSelect}
            selectedPlayerIds={exportPlayerIds.length > 0 ? exportPlayerIds : undefined}
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

        <ExportSelectModal
          isOpen={showExportSelect}
          onClose={() => setShowExportSelect(false)}
          players={gameState.players}
          onExport={handleExportPng}
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
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      <TopBar
        onHelpClick={() => setShowHelp(true)}
        onViewScoreClick={() => setShowScore(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      <PreRoundSetup
        setup={gameState.roundSetup}
        players={gameState.players}
        currentHole={gameState.currentHole}
        hasStarted={gameState.hasStarted}
        onSetupChange={handleSetupChange}
        onPlayersChange={handlePlayersChange}
        onStart={handleStartRound}
        onNewRound={handleNewRound}
      />

      {gameState.hasStarted && (
        <>
          <main
            ref={scoringAreaRef}
            className="flex-1 min-h-0 p-3 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            data-testid="scoring-area"
          >
            {renderPlayerGrid()}
          </main>

          <BottomControls
            currentHole={gameState.currentHole}
            totalHoles={gameState.roundSetup.holeCount}
            par={gameState.currentHolePar}
            yardage={gameState.currentHoleYardage}
            onParChange={handleParChange}
            onFinishHole={handleFinishHole}
            onResetHole={handleResetHole}
            onHoleLongPress={() => setShowHoleJump(true)}
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
        onClose={() => {
          setShowSubtotal(null);
          // Show hole info prompt for hole 10 after front 9 subtotal
          if (showSubtotal === 'front9' && pendingNextHole === 10) {
            setShowHoleInfo(true);
          }
        }}
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

      <BirdieCelebration
        isVisible={showBirdieCelebration}
        onComplete={() => setShowBirdieCelebration(false)}
      />

      <HoleInfoModal
        isOpen={showHoleInfo}
        onClose={() => {
          setShowHoleInfo(false);
          setPendingNextHole(null);
        }}
        holeNumber={pendingNextHole || gameState.currentHole}
        onSubmit={handleHoleInfoSubmit}
      />

      <HoleJumpModal
        isOpen={showHoleJump}
        onClose={() => setShowHoleJump(false)}
        currentHole={gameState.currentHole}
        totalHoles={gameState.roundSetup.holeCount}
        onSelectHole={handleJumpToHole}
      />
    </div>
  );
}

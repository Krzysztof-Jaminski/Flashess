import React, { useState } from "react";
import Buttons from "./buttons";
import { Chess } from "chess.js";
import { Exercise } from "../utils/exercises";
import MoveHistory from "./MoveHistory";
import AppNumberInput from "./AppNumberInput";

interface RightPanelProps {
  userMaxMoves: string;
  setUserMaxMoves: (v: string) => void;
  autoStartingMoves: boolean;
  setAutoStartingMoves: (v: (prev: boolean) => boolean) => void;
  autoMovesLimit: string;
  setAutoMovesLimit: (v: string) => void;
  hintMode: boolean;
  setHintMode: (v: (prev: boolean) => boolean) => void;
  visionMode: boolean;
  setVisionMode: (v: (prev: boolean) => boolean) => void;
  showMistakes: boolean;
  mistakes: number[];
  currentExercise: Exercise | null;
  setCurrentMoveIndex: (idx: number) => void;
  setShowMistakes: (v: boolean) => void;
  setMistakes: (v: number[]) => void;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  historyIndex: number | null;
  currentMoveIndex: number;
  onGoToMove?: (moveIdx: number) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  userMaxMoves,
  setUserMaxMoves,
  autoStartingMoves,
  setAutoStartingMoves,
  autoMovesLimit,
  setAutoMovesLimit,
  hintMode,
  setHintMode,
  visionMode,
  setVisionMode,
  showMistakes,
  mistakes,
  currentExercise,
  setCurrentMoveIndex,
  setShowMistakes,
  setMistakes,
  showHistory,
  setShowHistory,
  historyIndex,
  currentMoveIndex,
  onGoToMove
}) => {
  const [startBoardMoveNumber, setStartBoardMoveNumber] = useState(1);

  return (
    <div className="w-[300px] h-full border rounded-lg p-4 flex flex-col" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--blue-84)' }}>
      <div className="mb-4">
        <label htmlFor="maxMovesInput" className="block text-white/80 text-sm mb-1">Moves limit (0 = until the end):</label>
        <AppNumberInput
          id="maxMovesInput"
          value={userMaxMoves}
          onChange={setUserMaxMoves}
          min={0}
          placeholder="e.g. 20"
          className="max-w-[90px] mb-2"
        />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Buttons
          bUTTON={autoStartingMoves ? "ON" : "OFF"}
          onLogInButtonContainerClick={() => setAutoStartingMoves(v => !v)}
          className={`!py-1 !px-3 !text-xs !rounded`}
        />
        <span className="text-white/80 text-sm">Automatic starting moves</span>
      </div>
      {autoStartingMoves && (
        <div className="mb-4">
          <label htmlFor="autoMovesLimitInput" className="block text-white/80 text-sm mb-1">Automatic moves up to move:</label>
          <AppNumberInput
            id="autoMovesLimitInput"
            value={autoMovesLimit}
            onChange={setAutoMovesLimit}
            min={0}
            max={parseInt(userMaxMoves) || undefined}
            placeholder="e.g. 3"
            className="max-w-[90px] mb-2"
          />
        </div>
      )}
      <div className="mb-4 flex items-center gap-2">
        <Buttons
          bUTTON={hintMode ? "ON" : "OFF"}
          onLogInButtonContainerClick={() => setHintMode(v => !v)}
          className={`!py-1 !px-3 !text-xs !rounded`}
        />
        <span className="text-white/80 text-sm">Hint mode</span>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Buttons
          bUTTON={visionMode ? "ON" : "OFF"}
          onLogInButtonContainerClick={() => setVisionMode(v => !v)}
          className={`!py-1 !px-3 !text-xs !rounded`}
        />
        <span className="text-white/80 text-sm">Vision mode</span>
      </div>
      <h3 className="text-lg mb-3" style={{ color: 'var(--blue-84)' }}>Mistake Flashcards</h3>
      {showMistakes && mistakes.length > 0 ? (
        <div className="space-y-4">
          {mistakes.map((idx) => (
            <div key={idx} className="p-2 rounded" style={{ background: 'rgba(255,0,0,0.10)', border: '1.5px solid var(--red-55)' }}>
              <div className="text-white/80 text-sm">Move {idx + 1}: <span className="font-bold">{currentExercise?.analysis[idx].move}</span></div>
            </div>
          ))}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                if (!currentExercise || mistakes.length === 0) return;
                const firstMistake = mistakes[0];
                // Cofnij grę do pozycji sprzed pierwszego błędu
                const chess = new Chess(currentExercise.initialFen);
                for (let i = 0; i < firstMistake; i++) {
                  chess.move(currentExercise.analysis[i].move);
                }
                setCurrentMoveIndex(firstMistake);
                setShowMistakes(false);
                setMistakes([]);
                setStartBoardMoveNumber(Math.floor(firstMistake / 2) + 1);
              }}
              style={{ background: 'var(--blue-84)', color: '#000', borderRadius: 8, fontWeight: 'bold', padding: '8px 16px', border: '1.5px solid var(--blue-84)' }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : showMistakes ? (
        <div className="text-center" style={{ color: 'var(--green)' }}>No mistakes! Well done!</div>
      ) : (
        <div className="text-white/50 text-sm">Complete the exercise to see your mistakes as flashcards.</div>
      )}
      <div className="mt-auto pt-4">
        <MoveHistory
          currentExercise={currentExercise}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          historyIndex={historyIndex}
          currentMoveIndex={currentMoveIndex}
          onGoToMove={onGoToMove}
        />
      </div>
    </div>
  );
};

export default RightPanel; 
import React, { useState } from "react";
import Buttons from "./buttons";
import { Chess } from "chess.js";
import { Exercise } from "../utils/exercises";
import MoveHistory from "./MoveHistory";
import AppNumberInput from "./AppNumberInput";
import MoveInput from "./MoveInput";

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
  fixedMistakes: number[];
  reviewingMistakes: boolean;
  exerciseResults: {[key: string]: {completed: number, attempted: number}};
  onStartMistakeReview: () => void;
  currentExercise: Exercise | null;
  setCurrentMoveIndex: (idx: number) => void;
  setShowMistakes: (v: boolean) => void;
  setMistakes: (v: number[]) => void;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  historyIndex: number | null;
  currentMoveIndex: number;
  fen: string;
  onMoveInput: (move: string) => boolean;
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
  fixedMistakes,
  reviewingMistakes,
  exerciseResults,
  onStartMistakeReview,
  currentExercise,
  setCurrentMoveIndex,
  setShowMistakes,
  setMistakes,
  showHistory,
  setShowHistory,
  historyIndex,
  currentMoveIndex,
  fen,
  onMoveInput,
  onGoToMove
}) => {
  const [startBoardMoveNumber, setStartBoardMoveNumber] = useState(1);

  return (
    <div className="glass-panel w-[300px] rounded-lg p-4 flex flex-col" style={{ minHeight: 705, marginTop: 0, alignSelf: 'flex-start' }}>
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
      {currentExercise && (
        <div className="mb-4 p-3 rounded" style={{ background: 'rgba(36,245,228,0.08)', border: '1px solid rgba(36,245,228,0.2)' }}>
          <div className="text-white/80 text-sm mb-1">
            Move {Math.floor((currentMoveIndex) / 2) + 1} of {Math.floor(currentExercise.analysis.length / 2)}
          </div>
          <div className="text-xs text-white/60">
            Mistakes: {mistakes.length}
          </div>
        </div>
      )}
      <MoveInput 
        fen={fen} 
        onMove={onMoveInput}
        disabled={reviewingMistakes || !currentExercise}
      />
      <h3 className="text-lg mb-3" style={{ color: 'var(--blue-84)' }}>Mistake Review</h3>
      {mistakes.length > 0 ? (
        <div className="space-y-3">
          {reviewingMistakes && (
            <div className="p-2 rounded mb-3" style={{ background: 'rgba(36,245,228,0.15)', border: '1px solid rgba(36,245,228,0.3)' }}>
              <div className="text-white/90 text-xs text-center font-bold">Reviewing Mistakes Mode</div>
            </div>
          )}
          <div className="grid grid-cols-5 gap-2">
            {mistakes.map((idx) => {
              const isFixed = fixedMistakes.includes(idx);
              return (
                <div 
                  key={idx} 
                  className="w-10 h-10 rounded flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  style={{ 
                    background: isFixed ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)', 
                    border: `2px solid ${isFixed ? '#00ff00' : '#ff0000'}`,
                    color: isFixed ? '#00ff00' : '#ff0000'
                  }}
                  title={`Move ${idx + 1}: ${currentExercise?.analysis[idx].move}`}
                  tabIndex={0}
                  role="button"
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
          {!reviewingMistakes && (
            <div className="mt-4 text-center">
              <Buttons
                bUTTON="Review Mistakes"
                onLogInButtonContainerClick={onStartMistakeReview}
                className="!py-2 !px-4"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-white/50 text-sm">No mistakes yet. Complete the exercise!</div>
      )}
      <div className="mt-auto pt-4">
        <MoveHistory
          currentExercise={currentExercise}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          historyIndex={historyIndex}
          currentMoveIndex={currentMoveIndex}
          reviewingMistakes={reviewingMistakes}
          onGoToMove={onGoToMove}
        />
      </div>
    </div>
  );
};

export default RightPanel; 
import React from "react";
import Buttons from "./buttons";
import { Exercise } from "../utils/exercises";

interface MoveHistoryProps {
  currentExercise: Exercise | null;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  historyIndex: number | null;
  currentMoveIndex: number;
  onGoToMove?: (moveIdx: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ currentExercise, showHistory, setShowHistory, historyIndex, currentMoveIndex, onGoToMove }) => {
  if (!currentExercise) return null;
  if (!showHistory) return (
    <div className="flex items-center gap-2 mt-2 mb-1">
      <Buttons
        bUTTON={showHistory ? "ON" : "OFF"}
        onLogInButtonContainerClick={() => setShowHistory(true)}
        className={`!py-1 !px-3 !text-xs !rounded ${showHistory ? 'border-cyan-400 text-cyan-300' : ''}`}
      />
      {!showHistory && <span className="text-white/80 text-xs">Show history</span>}
    </div>
  );
  const moves = currentExercise.analysis.map(a => a.move).filter(m => !["0-1", "1-0", "*", "½-½"].includes(m));
  let out: string[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const num = Math.floor(i / 2) + 1;
    const white = moves[i] || "";
    const black = moves[i + 1] || "";
    out.push(`${num}. ${white} ${black}`.trim());
  }

  const handleCopyPGN = () => {
    const pgn = moves.join(" ");
    navigator.clipboard.writeText(pgn);
  };

  return (
    <div className="rounded p-2 mt-2 text-xs text-white/80 max-h-64 overflow-y-auto custom-scrollbar"
      style={{ background: 'rgba(36,245,228,0.08)', border: '1.5px solid var(--blue-18)' }}>
      <div className="font-bold mb-1 flex items-center justify-between">
        <span>Move history</span>
        <div className="flex items-center gap-2">
          <Buttons
            bUTTON="Copy PGN"
            onLogInButtonContainerClick={handleCopyPGN}
            className="!py-1 !px-3 !text-xs !rounded border-cyan-400"
          />
          <Buttons
            bUTTON={showHistory ? "ON" : "OFF"}
            onLogInButtonContainerClick={() => setShowHistory(false)}
            className={`!py-1 !px-3 !text-xs !rounded`}
          />
          <span className="text-white/80 text-xs">Show history</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {out.map((line, idx) => {
          const moveIdx = Math.min((idx + 1) * 2, moves.length);
          const isActive = historyIndex !== null && historyIndex <= moveIdx && historyIndex > moveIdx - 2;
          return (
            <span
              key={idx}
              className={isActive ? "font-bold cursor-pointer" : "cursor-pointer hover:text-cyan-300"}
              style={isActive ? { color: 'var(--blue-84)' } : {}}
              onClick={() => {
                console.log('Kliknięto wiersz historii', { idx, moveIdx, historyIndex });
                if (onGoToMove) onGoToMove(moveIdx);
              }}
              title={`Pokaż pozycję po ruchu ${line}`}
            >
              {line}
            </span>
          );
        })}
      </div>
      <div className="mt-1 text-white/50 text-xs">Use ←/→ arrows to browse history</div>
    </div>
  );
};

export default MoveHistory; 
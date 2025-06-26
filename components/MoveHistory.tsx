import React from "react";
import Buttons from "./buttons";
import { Exercise } from "../utils/exercises";

interface MoveHistoryProps {
  currentExercise: Exercise | null;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  historyIndex: number | null;
  currentMoveIndex: number;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ currentExercise, showHistory, setShowHistory, historyIndex, currentMoveIndex }) => {
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
  return (
    <div className="rounded p-2 mt-2 text-xs text-white/80 max-h-64 overflow-y-auto custom-scrollbar"
      style={{ background: 'rgba(36,245,228,0.08)', border: '1.5px solid var(--blue-18)' }}>
      <div className="font-bold mb-1 flex items-center justify-between">
        <span>Move history</span>
        <div className="flex items-center gap-2">
          <Buttons
            bUTTON={showHistory ? "ON" : "OFF"}
            onLogInButtonContainerClick={() => setShowHistory(false)}
            className={`!py-1 !px-3 !text-xs !rounded`}
            style={showHistory ? { borderColor: 'var(--blue-84)', color: 'var(--blue-84)' } : {}}
          />
          <span className="text-white/80 text-xs">Show history</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {out.map((line, idx) => (
          <span key={idx} className={historyIndex !== null && Math.floor(historyIndex/2) === idx ? "font-bold" : ""} style={historyIndex !== null && Math.floor(historyIndex/2) === idx ? { color: 'var(--blue-84)' } : {}}>{line}</span>
        ))}
      </div>
      <div className="mt-1 text-white/50 text-xs">Use ←/→ arrows to browse history</div>
    </div>
  );
};

export default MoveHistory; 
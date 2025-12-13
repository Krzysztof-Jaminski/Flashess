import React, { useEffect, useRef } from "react";
import Buttons from "./buttons";
import { Exercise } from "../utils/exercises";

interface MoveHistoryProps {
  currentExercise: Exercise | null;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  historyIndex: number | null;
  currentMoveIndex: number;
  reviewingMistakes?: boolean;
  onGoToMove?: (moveIdx: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ currentExercise, showHistory, setShowHistory, historyIndex, currentMoveIndex, reviewingMistakes = false, onGoToMove }) => {
  const activeMoveRef = useRef<HTMLSpanElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to active move when it changes (only when history is shown)
  useEffect(() => {
    if (!showHistory || !activeMoveRef.current || !scrollContainerRef.current) return;

    // Użyj setTimeout aby upewnić się że DOM został zaktualizowany
    setTimeout(() => {
      activeMoveRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }, 0);
  }, [showHistory, currentMoveIndex, historyIndex]); // Added showHistory to dependencies

  if (!currentExercise) {
    return null;
  }

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

  // Maksymalna liczba par ruchów do wyświetlenia wokół aktualnego historyIndex
  const MAX_VISIBLE_PAIRS_AROUND = 7; // 7 par przed i 7 par po = 14 par total
  const totalPairs = out.length;
  const isHistoryLong = totalPairs > MAX_VISIBLE_PAIRS_AROUND * 2;
  
  // Określ które pary ruchów pokazać
  let visiblePairs: string[] = [];
  let startIdx = 0;
  let endIdx = totalPairs;
  
  // Użyj historyIndex jeśli dostępny, w przeciwnym razie currentMoveIndex
  const activeIndex = historyIndex !== null ? historyIndex : currentMoveIndex;
  
  if (isHistoryLong) {
    // Oblicz indeks pary dla aktualnego indeksu
    const currentPairIdx = Math.floor(activeIndex / 2);
    
    // Oblicz zakres do pokazania (centruj wokół currentPairIdx)
    const startPairIdx = Math.max(0, currentPairIdx - MAX_VISIBLE_PAIRS_AROUND);
    const endPairIdx = Math.min(totalPairs, currentPairIdx + MAX_VISIBLE_PAIRS_AROUND + 1);
    
    visiblePairs = out.slice(startPairIdx, endPairIdx);
    startIdx = startPairIdx;
    endIdx = endPairIdx;
  } else {
    // Jeśli historia jest krótka, pokaż wszystkie
    visiblePairs = out;
  }

  // Stała wysokość - taka sama jak gdy jest pusty (nagłówek + tekst + padding)
  const fixedHeight = 120; // wysokość wystarczająca dla pustego boxa

  if (!showHistory) {
    return (
      <div className="flex items-center gap-2 mt-2 mb-1">
        <Buttons
          bUTTON={showHistory ? "ON" : "OFF"}
          onLogInButtonContainerClick={() => !reviewingMistakes && setShowHistory(true)}
          className={`!py-1 !px-3 !text-xs !rounded ${showHistory ? 'border-cyan-400 text-cyan-300' : ''} ${reviewingMistakes ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {!showHistory && <span className="text-white/80 text-xs">Show history{reviewingMistakes ? ' (disabled in review)' : ''}</span>}
      </div>
    );
  }

  return (
    <div
      className="rounded p-2 mt-2 text-xs text-white/80"
      style={{
        background: 'rgba(36,245,228,0.08)',
        border: '1.5px solid var(--blue-18)',
        height: `${fixedHeight}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
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
        </div>
      </div>
      {isHistoryLong && (
        <div className="text-white/50 text-xs mb-1">
          Showing moves around current position ({startIdx + 1}-{endIdx} of {totalPairs})
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="flex flex-wrap gap-x-3 gap-y-1 move-history-scroll"
        style={{
          overflowY: 'auto',
          overflowX: 'auto',
          flex: '1',
          maxHeight: '100%'
        }}
      >
        {visiblePairs.map((line, idx) => {
          const actualIdx = isHistoryLong ? startIdx + idx : idx;
          const moveIdx = Math.min((actualIdx + 1) * 2, moves.length);
          const isActive = activeIndex <= moveIdx && activeIndex > moveIdx - 2;
          return (
            <span
              key={actualIdx}
              ref={isActive ? activeMoveRef : null}
              className={`move-history-item ${isActive ? "font-bold cursor-pointer" : "cursor-pointer hover:text-cyan-300"}`}
              style={isActive ? { color: 'var(--blue-84)' } : {}}
              onClick={() => {
                if (onGoToMove) onGoToMove(moveIdx);
              }}
              title={`Pokaż pozycję po ruchu ${line}`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onGoToMove) onGoToMove(moveIdx);
                }
              }}
            >
              {line}
            </span>
          );
        })}
      </div>
      <div className="mt-1 text-white/50 text-xs" style={{ flexShrink: 0 }}>Use ←/→ arrows to browse history</div>
    </div>
  );
};

export default MoveHistory; 
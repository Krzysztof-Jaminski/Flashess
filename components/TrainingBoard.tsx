import React from "react";
import { Chessboard } from "react-chessboard";
import { Exercise } from "../utils/exercises";

interface TrainingBoardProps {
  fen: string;
  boardHighlight: string | null;
  onPieceDrop: (source: string, target: string, piece: string) => boolean;
  hintSquares: { [square: string]: React.CSSProperties };
  boardOrientation: 'white' | 'black';
  mistakes: number[];
  currentMoveIndex: number;
  currentExercise: Exercise | null;
}

const TrainingBoard: React.FC<TrainingBoardProps> = ({
  fen,
  boardHighlight,
  onPieceDrop,
  hintSquares,
  boardOrientation,
  mistakes,
  currentMoveIndex,
  currentExercise
}) => (
  <div className="flex-1 border rounded-lg p-4 flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.3)' }}>
    <div
      className="aspect-square mt-0"
      style={{ width: 700, height: 700, minWidth: 700, minHeight: 700, maxWidth: 700, maxHeight: 700 }}
    >
      <div className={`w-full h-full flex items-center justify-center mx-auto ${boardHighlight === 'red' ? 'ring-4' : ''}`}
        style={boardHighlight === 'red' ? { boxShadow: '0 0 0 4px var(--red-55)' } : {}}>
        <Chessboard
          position={fen}
          boardWidth={700}
          onPieceDrop={onPieceDrop}
          customSquareStyles={hintSquares}
          boardOrientation={boardOrientation}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            width: 700,
            height: 700
          }}
          customArrowColor="var(--blue-84)"
        />
      </div>
    </div>
    {currentExercise && (
      <div className="mt-4 text-center">
        <div className="text-white/80 mb-2">
          Move {Math.floor((currentMoveIndex) / 2) + 1} of {Math.floor(currentExercise.analysis.length / 2)}
        </div>
        <div className="text-sm text-white/60">
          Mistakes: {mistakes.length}
        </div>
      </div>
    )}
  </div>
);

export default TrainingBoard; 
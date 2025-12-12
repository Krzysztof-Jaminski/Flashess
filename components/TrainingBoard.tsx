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
  <div className="glass-panel-no-filter rounded-lg p-4" style={{ width: 716, minHeight: 705, marginTop: 0, alignSelf: 'flex-start' }}>
    <div style={{ width: 700, height: 700, position: 'relative' }}>
      <Chessboard
        position={fen}
        boardWidth={700}
        onPieceDrop={onPieceDrop}
        customSquareStyles={hintSquares}
        boardOrientation={boardOrientation}
        arePiecesDraggable={true}
        areArrowsAllowed={false}
        arePremovesAllowed={false}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customArrowColor="var(--blue-84)"
        customDropSquareStyle={{
          boxShadow: "inset 0 0 1px 4px rgba(36,245,228,0.5)"
        }}
      />
    </div>
  </div>
);

export default TrainingBoard;

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Exercise } from "../utils/exercises";
import type { Square } from "chess.js";

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
  }) => {
  const [markedSquares, setMarkedSquares] = useState<Set<Square>>(new Set());
  const boardRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rightClickStartRef = useRef<{ x: number; y: number } | null>(null);

  // Clear marked squares on left click
  const clearMarkedSquares = useCallback(() => {
    setMarkedSquares(new Set());
  }, []);

  // Handle right-click to mark/unmark squares (only on single click, not drag)
  const handleSquareRightClick = useCallback((square: Square) => {
    // Only mark if it was a single click (not a drag)
    if (!isDraggingRef.current) {
      setMarkedSquares(prev => {
        const newSet = new Set(prev);
        if (newSet.has(square)) {
          newSet.delete(square);
        } else {
          newSet.add(square);
        }
        return newSet;
      });
    }
  }, []);

  // Merge marked squares with hint squares
  const mergedSquareStyles: { [square: string]: React.CSSProperties } = {
    ...hintSquares,
  };

  // Add light blue background for marked squares (using app's cyan color)
  markedSquares.forEach(square => {
    mergedSquareStyles[square] = {
      ...mergedSquareStyles[square],
      background: 'rgba(36,245,228,0.5)', // App's cyan color
    };
  });

  // Helper function to get square from coordinates
  const getSquareFromCoordinates = useCallback((x: number, y: number, boardSize: number, orientation: 'white' | 'black'): Square | null => {
    const squareSize = boardSize / 8;
    let file = Math.floor(x / squareSize);
    let rank = Math.floor(y / squareSize);
    
    if (orientation === 'black') {
      file = 7 - file;
      rank = 7 - rank;
    } else {
      rank = 7 - rank;
    }
    
    if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
      const square = String.fromCharCode(97 + file) + (rank + 1) as Square;
      return square;
    }
    return null;
  }, []);

  // Add event listeners for mouse interactions
  useEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click - clear marked squares
        clearMarkedSquares();
        isDraggingRef.current = false;
      } else if (e.button === 2) {
        // Right click - track start position
        rightClickStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // If mouse moves while button is pressed, it's a drag
      if (e.buttons !== 0) {
        if (rightClickStartRef.current) {
          const dx = Math.abs(e.clientX - rightClickStartRef.current.x);
          const dy = Math.abs(e.clientY - rightClickStartRef.current.y);
          // If moved more than 5 pixels, consider it a drag
          if (dx > 5 || dy > 5) {
            isDraggingRef.current = true;
          }
        } else {
          isDraggingRef.current = true;
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && !isDraggingRef.current) {
        // Right click without drag - mark/unmark square
        const rect = boardElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const boardSize = 700;
        
        const square = getSquareFromCoordinates(x, y, boardSize, boardOrientation);
        if (square) {
          handleSquareRightClick(square);
        }
      }
      rightClickStartRef.current = null;
      isDraggingRef.current = false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Don't mark here - let mouseup handle it if it wasn't a drag
    };

    boardElement.addEventListener('mousedown', handleMouseDown);
    boardElement.addEventListener('mousemove', handleMouseMove);
    boardElement.addEventListener('mouseup', handleMouseUp);
    boardElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      boardElement.removeEventListener('mousedown', handleMouseDown);
      boardElement.removeEventListener('mousemove', handleMouseMove);
      boardElement.removeEventListener('mouseup', handleMouseUp);
      boardElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleSquareRightClick, clearMarkedSquares, getSquareFromCoordinates, boardOrientation]);

  return (
    <div className="glass-panel-no-filter rounded-lg p-4 flex items-center justify-center" style={{ width: 716, minHeight: 705, marginTop: 0, alignSelf: 'flex-start' }}>
      <div ref={boardRef} style={{ width: 700, height: 700, position: 'relative' }}>
        <Chessboard
          position={fen}
          boardWidth={700}
          onPieceDrop={onPieceDrop}
          customSquareStyles={mergedSquareStyles}
          boardOrientation={boardOrientation}
          arePiecesDraggable={true}
          areArrowsAllowed={true}
          arePremovesAllowed={false}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customArrowColor="rgba(36,245,228,0.84)"
          customDropSquareStyle={{
            boxShadow: "inset 0 0 1px 4px rgba(36,245,228,0.5)"
          }}
        />
      </div>
    </div>
  );
};

export default TrainingBoard;

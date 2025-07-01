import { Chess, Square } from "chess.js";

// Helper to check if a string is a valid Square
const isValidSquare = (sq: string): sq is Square => {
  return (
    sq.length === 2 &&
    sq[0] >= 'a' && sq[0] <= 'h' &&
    sq[1] >= '1' && sq[1] <= '8'
  );
};

export function getVisionOverlays(
  chess: Chess,
  color: 'w' | 'b' | 'both' = 'both'
): Record<string, Record<string, string | number>> {
  function getAttackedSquares(chess: Chess, color: 'w' | 'b') {
    const attacked: Record<string, number> = {};
    const board = chess.board();
    const pawnDir = color === 'w' ? 1 : -1;
    const knightMoves = [
      [2, 1], [1, 2], [-1, 2], [-2, 1],
      [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];
    const bishopDirs = [
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    const rookDirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ];
    // Sliding piece pressure: for each square, count all attackers along the line, not just until first blocker
    function addSlidingAttacks(r: number, c: number, dirs: number[][], type: string) {
      for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const sq = String.fromCharCode(97 + nc) + (8 - nr);
          if (isValidSquare(sq)) attacked[sq] = (attacked[sq] || 0) + 1;
          const blocker = board[nr][nc];
          if (blocker) {
            // If it's a friendly sliding piece (rook, bishop, queen), keep going (stacking pressure)
            if (
              blocker.color === color &&
              (blocker.type === 'r' || blocker.type === 'b' || blocker.type === 'q')
            ) {
              nr += dr; nc += dc;
              continue;
            }
            break; // Blocked by other piece
          }
          nr += dr; nc += dc;
        }
      }
    }
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === color) {
          const from = String.fromCharCode(97 + c) + (8 - r);
          if (!isValidSquare(from)) continue;
          if (piece.type === 'p') {
            // Pawn attacks only diagonally
            const targets = [];
            if (c > 0 && r - pawnDir >= 0 && r - pawnDir < 8) targets.push(String.fromCharCode(97 + c - 1) + (8 - (r - pawnDir)));
            if (c < 7 && r - pawnDir >= 0 && r - pawnDir < 8) targets.push(String.fromCharCode(97 + c + 1) + (8 - (r - pawnDir)));
            for (const sq of targets) {
              if (isValidSquare(sq)) attacked[sq] = (attacked[sq] || 0) + 1;
            }
          } else if (piece.type === 'n') {
            // Knight
            for (const [dr, dc] of knightMoves) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const sq = String.fromCharCode(97 + nc) + (8 - nr);
                if (isValidSquare(sq)) attacked[sq] = (attacked[sq] || 0) + 1;
              }
            }
          } else if (piece.type === 'b' || piece.type === 'q') {
            // Bishop or Queen (diagonals)
            addSlidingAttacks(r, c, bishopDirs, piece.type);
          }
          if (piece.type === 'r' || piece.type === 'q') {
            // Rook or Queen (straight lines)
            addSlidingAttacks(r, c, rookDirs, piece.type);
          }
          if (piece.type === 'k') {
            // King
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                  const sq = String.fromCharCode(97 + nc) + (8 - nr);
                  if (isValidSquare(sq)) attacked[sq] = (attacked[sq] || 0) + 1;
                }
              }
            }
          }
        }
      }
    }
    return attacked;
  }

  let overlays: Record<string, Record<string, string | number>> = {};
  let whiteAttacks: Record<string, number> = {};
  let blackAttacks: Record<string, number> = {};
  if (color === 'w' || color === 'both') whiteAttacks = getAttackedSquares(chess, 'w');
  if (color === 'b' || color === 'both') blackAttacks = getAttackedSquares(chess, 'b');
  const allSquares = Array.from(new Set([
    ...Object.keys(whiteAttacks),
    ...Object.keys(blackAttacks),
  ]));
  for (const sq of allSquares) {
    if (typeof sq === 'string' && isValidSquare(sq)) {
      const w = whiteAttacks[sq] || 0;
      const b = blackAttacks[sq] || 0;
      let r = 0, g = 0, bl = 0, a = 0;
      if (w > 0 && b === 0) {
        // Only white attacks
        r = 255; g = 0; bl = 0; a = 0.13 + 0.13 * (w - 1);
      } else if (b > 0 && w === 0) {
        // Only black attacks
        r = 0; g = 100; bl = 255; a = 0.13 + 0.13 * (b - 1);
      } else if (w > 0 && b > 0) {
        if (w > b) {
          // More white attackers than black defenders
          r = 255; g = 0; bl = 0; a = 0.18 + 0.10 * (w - b - 1);
        } else if (b > w) {
          // More black attackers than white defenders
          r = 0; g = 100; bl = 255; a = 0.18 + 0.10 * (b - w - 1);
        } else {
          // Equal attackers and both attack: dark, subtle purple (blend of 1x red and 1x blue)
          r = 120; g = 0; bl = 180; a = 0.18;
        }
      }
      if (w > 0 || b > 0) {
        overlays[sq] = {
          background: `rgba(${r},${g},${bl},${Math.min(a,0.6)})`
        };
      }
    }
  }
  return overlays;
} 
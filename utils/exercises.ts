import exercisesData from './exercises.json';

export interface AnalysisMove {
  move: string;
  evaluation: number;
  isCritical: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  initialFen: string;
  analysis: AnalysisMove[];
  createdAt: string;
  maxMoves?: number;
}

// Helper to normalize PGN to a string of moves (optionally up to N-2 moves)
function normalizeMoves(pgn: string, trimLast: number = 2): string {
  let moves = pgn
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\d+\./g, "")
    .replace(/\d+-\d+|1-0|0-1|1\/2-1\/2|\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (moves.length > trimLast) moves = moves.slice(0, moves.length - trimLast);
  return moves.join(" ");
}

export function getExercises(): Exercise[] {
  const seen = new Set<string>();
  const deduped: any[] = [];
  for (const ex of exercisesData as any[]) {
    const norm = normalizeMoves(ex.pgn, 2); // ignore last 2 moves for similarity
    if (!seen.has(norm)) {
      seen.add(norm);
      let moves = ex.pgn.includes("[")
        ? normalizeMoves(ex.pgn, 0).split(" ")
        : ex.pgn.replace(/\d+\./g, "").trim().split(/\s+/).filter(Boolean);
      deduped.push({
        id: ex.id,
        name: ex.name,
        initialFen: ex.initialFen,
        analysis: moves.map((move: string) => ({ move, evaluation: 0, isCritical: false })),
        createdAt: new Date().toISOString(),
        maxMoves: ex.maxMoves,
      });
    }
  }
  return deduped;
} 
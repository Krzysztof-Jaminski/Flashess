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

// Prosty parser PGN (bez nagłówków)
export function parsePGN(pgn: string): string[] {
  return pgn
    .replace(/\d+\./g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Parser pełnego PGN z nagłówkami, komentarzami, wariantami
export function parseFullPGN(pgn: string): string[] {
  let movesPart = pgn
    .replace(/\[[^\]]*\]/g, "") // usuń nagłówki
    .replace(/\{[^}]*\}/g, "") // usuń komentarze
    .replace(/\([^)]*\)/g, "") // usuń warianty
    .replace(/\d+\./g, "") // usuń numery ruchów
    .replace(/\d+-\d+|1-0|0-1|1\/2-1\/2|\*/g, "") // usuń wynik
    .replace(/\s+/g, " ")
    .trim();
  return movesPart.split(" ").filter(Boolean);
}

export function getExercises(): Exercise[] {
  return (exercisesData as any[]).map((ex) => {
    let moves: string[];
    if (ex.pgn.includes("[")) {
      moves = parseFullPGN(ex.pgn);
    } else {
      moves = parsePGN(ex.pgn);
    }
    return {
      id: ex.id,
      name: ex.name,
      initialFen: ex.initialFen,
      analysis: moves.map((move: string) => ({ move, evaluation: 0, isCritical: false })),
      createdAt: new Date().toISOString(),
      maxMoves: ex.maxMoves,
    };
  });
} 
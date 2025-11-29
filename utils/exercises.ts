import exercisesData from './exercises.json';
import { Chess } from 'chess.js';
import { exercisesApi } from './api';

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
  color?: 'white' | 'black';
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

export function getCustomExercises(): Exercise[] {
  if (typeof window === 'undefined') return [];
  try {
    const arr = JSON.parse(localStorage.getItem('customExercises') || '[]');
    
    return arr.map((ex: any) => {
      // Parsuj PGN do listy ruchów - używamy tej samej logiki co dla regularnych ćwiczeń
      let moves: string[] = [];
      if (ex.pgn) {
        // Sprawdź czy to pełny PGN z numerami czy tylko ruchy
        if (ex.pgn.includes('.')) {
          // Pełny PGN z numerami - usuń nagłówki PGN i inne elementy
          const cleanPgn = ex.pgn
            .replace(/\[[^\]]*\]/g, "")
            .replace(/\{[^}]*\}/g, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/\d+\./g, "")
            .replace(/\d+-\d+|1-0|0-1|1\/2-1\/2|\*/g, "")
            .replace(/\s+/g, " ")
            .trim();
          
          moves = cleanPgn.split(" ").filter(Boolean);
        } else {
          // Tylko ruchy bez numerów - podziel po spacji
          moves = ex.pgn.split(" ").filter(Boolean);
        }
      }
      
      // Konwertuj ruchy do formatu analysis
      const analysis = moves.map((move: string) => ({ 
        move, 
        evaluation: 0, 
        isCritical: false 
      }));
      
      const exercise: Exercise = {
        id: ex.id,
        name: ex.name,
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Proper FEN for starting position
        analysis: analysis,
        createdAt: ex.createdAt,
        maxMoves: undefined,
        // Dodaj informację o kolorze dla ćwiczeń z custom color
        color: ex.color || 'white',
      };
      
      return exercise;
    });
  } catch (error) {
    console.error('Error parsing custom exercises:', error);
    return [];
  }
}

export async function getPublicExercisesFromBackend(): Promise<Exercise[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const publicExercises = await exercisesApi.getPublicExercises();
    return publicExercises.map((ex: any) => {
      let moves: string[] = [];
      if (ex.pgn) {
        if (ex.pgn.includes('.')) {
          const cleanPgn = ex.pgn
            .replace(/\[[^\]]*\]/g, "")
            .replace(/\{[^}]*\}/g, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/\d+\./g, "")
            .replace(/\d+-\d+|1-0|0-1|1\/2-1\/2|\*/g, "")
            .replace(/\s+/g, " ")
            .trim();
          moves = cleanPgn.split(" ").filter(Boolean);
        } else {
          moves = ex.pgn.split(" ").filter(Boolean);
        }
      }
      
      return {
        id: `backend-${ex.id}`,
        name: ex.name,
        initialFen: ex.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        analysis: moves.map((move: string) => ({ move, evaluation: 0, isCritical: false })),
        createdAt: ex.createdAt,
        maxMoves: undefined,
        color: ex.color || 'white',
      };
    });
  } catch (error) {
    console.error('Error loading public exercises from backend:', error);
    return [];
  }
}

export function getExercises(): Exercise[] {
  const seen = new Set<string>();
  const deduped: Exercise[] = [];
  
  for (const ex of exercisesData as any[]) {
    // Użyj kombinacji ruchów i koloru do deduplikacji
    const norm = normalizeMoves(ex.pgn, 2) + '|' + (ex.color || 'white');
    if (!seen.has(norm)) {
      seen.add(norm);
      
      let moves = ex.pgn.includes("[")
        ? normalizeMoves(ex.pgn, 0).split(" ")
        : ex.pgn.replace(/\d+\./g, "").trim().split(/\s+/).filter(Boolean);
      
      // Sprawdź czy ćwiczenie ma poprawną pozycję początkową
      let validFen = ex.initialFen;
      try {
        const chess = new Chess(ex.initialFen);
        validFen = chess.fen();
        
        // Sprawdź czy pierwszy ruch jest legalny
        if (moves.length > 0) {
          const firstMove = moves[0];
          const legalMoves = chess.moves({ verbose: true });
          const isLegal = legalMoves.some(m => m.san === firstMove);
          
          if (!isLegal) {
            // Jeśli pierwszy ruch nie jest legalny, może to oznaczać że ćwiczenie ma nieprawidłową pozycję początkową
            // Na razie po prostu kontynuujemy
          }
        }
      } catch (error) {
        // Użyj standardowej pozycji początkowej
        validFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      }
      
      const exercise: Exercise = {
        id: ex.id,
        name: ex.name,
        initialFen: validFen,
        analysis: moves.map((move: string) => ({ move, evaluation: 0, isCritical: false })),
        createdAt: new Date().toISOString(),
        maxMoves: ex.maxMoves,
        // Użyj kolor z pliku JSON, a jeśli nie ma to sprawdź ID
        color: ex.color || (ex.id.includes('black') ? 'black' : 'white'),
      };
      
      deduped.push(exercise);
    }
  }
  
  // Dodaj customowe ćwiczenia z localStorage (jeśli jesteśmy w przeglądarce)
  let custom: Exercise[] = [];
  if (typeof window !== 'undefined') {
    try {
      custom = getCustomExercises();
    } catch {}
  }
  
  const result = [...deduped, ...custom];
  return result;
} 
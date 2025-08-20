"use client";
import type { NextPage } from "next";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import TopBar from "../../components/topbar";
import Buttons from "../../components/buttons";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getExercises, Exercise } from "../../utils/exercises";
import ExerciseList from "../../components/ExerciseList";
import TrainingBoard from "../../components/TrainingBoard";
import RightPanel from "../../components/RightPanel";
// @ts-ignore
// import exercisesData from "../utils/exercises.json";

function smartSort(a: string, b: string): number {
  // Poprawiony regex: myślnik na końcu klasy znaków
  const regex = /^([a-zA-Z_ \-]*?)(\d+)([a-zA-Z_ \-]*)$/;
  const matchA = a.match(regex);
  const matchB = b.match(regex);

  if (matchA && matchB) {
    const [, prefixA, numA, suffixA] = matchA;
    const [, prefixB, numB, suffixB] = matchB;

    if (prefixA === prefixB && suffixA === suffixB) {
      return parseInt(numA, 10) - parseInt(numB, 10);
    }
  }
  return a.localeCompare(b);
}

const TrainingPage: NextPage = () => {
  const [game, setGame] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(600);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [showMistakes, setShowMistakes] = useState(false);
  const [boardHighlight, setBoardHighlight] = useState<string | null>(null); // 'red' jeśli błąd
  const [hintMode, setHintMode] = useState(false);
  const [pendingComputerMove, setPendingComputerMove] = useState<string | null>(null);
  const [userMaxMoves, setUserMaxMoves] = useState<string>("");
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [autoStartingMoves, setAutoStartingMoves] = useState(false);
  const [autoMovesLimit, setAutoMovesLimit] = useState('4');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null); // null = tryb treningowy
  const [preHistoryTrainingIndex, setPreHistoryTrainingIndex] = useState<number | null>(null); // do powrotu
  const [showHistory, setShowHistory] = useState(false);
  const [autoStartMoveIndex, setAutoStartMoveIndex] = useState(0);
  const [startBoardMoveNumber, setStartBoardMoveNumber] = useState(1);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [visionMode, setVisionMode] = useState(false);
  const boardRef = useRef<any>(null);

  // Helper to check if a string is a valid Square
  const isValidSquare = (sq: string): sq is Square => {
    return (
      sq.length === 2 &&
      sq[0] >= 'a' && sq[0] <= 'h' &&
      sq[1] >= '1' && sq[1] <= '8'
    );
  };

  // Helper to check if a move belongs to white
  const isWhiteMove = (chess: Chess, moveSan: string): boolean => {
    const legalMoves = chess.moves({ verbose: true });
    const isLegal = legalMoves.some(m => m.san === moveSan);

    return isLegal;
  };

  // HINT MODE: podświetlenie pola figury do ruszenia
  let hintSquares: { [key in Square]?: React.CSSProperties } = {};
  if (hintMode && currentExercise && currentMoveIndex < currentExercise.analysis.length) {
    const fen = game.fen();
    const chessTmp = new Chess(fen);
    const currentAnalysis = currentExercise.analysis[currentMoveIndex];
    if (currentAnalysis) {
      const moveSan = currentAnalysis.move;
      const legalMoves = chessTmp.moves({ verbose: true });
      const correctMove = legalMoves.find((m) => m.san === moveSan);
      if (correctMove && typeof correctMove.from === 'string' && isValidSquare(correctMove.from)) {
        hintSquares[correctMove.from] = { background: 'rgba(36,245,228,0.5)' };
      }
    }
  }

  // Pobieranie ćwiczeń z API
  const fetchExercises = async () => {
    const fetchedExercises = getExercises();
    const sortedExercises = fetchedExercises.sort((a, b) => smartSort(a.id, b.id));
    setExercises(sortedExercises);
  };

  // Funkcja do ustawiania pozycji na podstawie indeksu historii
  const goToHistoryIndex = (idx: number) => {
    if (!currentExercise) return;
    const chess = new Chess(currentExercise.initialFen);
    for (let i = 0; i < idx; i++) {
      const move = currentExercise.analysis[i]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) break;
      chess.move(move);
    }
    setGame(chess);
    setCurrentMoveIndex(idx);
    setHistoryIndex(idx);
  };

  // Obsługa strzałek lewo/prawo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentExercise) return;
      if (e.key === "ArrowLeft") {
        if (historyIndex === null) {
          setPreHistoryTrainingIndex(currentMoveIndex);
          if (currentMoveIndex > 0) goToHistoryIndex(currentMoveIndex - 1);
        } else if (historyIndex > 0) {
          goToHistoryIndex(historyIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (historyIndex !== null && historyIndex < currentExercise.analysis.length) {
          goToHistoryIndex(historyIndex + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentExercise, historyIndex, currentMoveIndex]);

  const checkMovesLimit = (nextMoveNumber: number) => {
    const movesLimitNum = parseInt(userMaxMoves) || 0;
    if (movesLimitNum > 0 && nextMoveNumber > movesLimitNum) {
      setShowMistakes(true);
      return true;
    }
    return false;
  };

  // Obsługa ruchu na szachownicy
  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece?: string) => {
    if (historyIndex !== null && currentExercise) {
      // wróć do trybu treningowego
      const idx = preHistoryTrainingIndex ?? currentExercise.analysis.length;
      goToHistoryIndex(idx);
      setHistoryIndex(null);
      setPreHistoryTrainingIndex(null);
      return false;
    }
    if (!currentExercise) return false;
    // Sprawdź, czy ruch jest legalny zanim wywołasz game.move
    const legalMoves = game.moves({ verbose: true });
    const isLegal = legalMoves.some(m => m.from === sourceSquare && m.to === targetSquare);
    if (!isLegal) return false;

    // Jeśli komputer ma wykonać ruch, a użytkownik już wykonał swój (premove)
    if (pendingComputerMove) {
      // Sprawdź, czy ruch użytkownika jest poprawny
      const moveSan = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!moveSan) return false;
      const expectedMove = currentExercise.analysis[currentMoveIndex].move;
      if (moveSan.san === expectedMove) {
        setGame(new Chess(game.fen()));
        setCurrentMoveIndex((prev) => prev + 1);
        setIsCorrect(true);
        setBoardHighlight(null);
        // Wykonaj natychmiast ruch komputera
        const nextIdx = currentMoveIndex + 1;
        let nextMoveNumber = startBoardMoveNumber;
        if (nextIdx % 2 === 0) nextMoveNumber++;
        setStartBoardMoveNumber(nextMoveNumber);
        if (checkMovesLimit(nextMoveNumber)) return false;
        if (nextIdx < currentExercise.analysis.length) {
          const nextMove = currentExercise.analysis[nextIdx].move;
          // Jeśli nextMove to wynik partii, nie wykonuj ruchu
          if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
            setShowMistakes(true);
            setPendingComputerMove(null);
            if (isRandomMode) {
              setTimeout(() => {
                loadRandomExercise();
              }, 1200);
            }
            return false;
          }
          const newGame = new Chess(game.fen());
          newGame.move(nextMove);
          setGame(newGame);
          setCurrentMoveIndex(nextIdx + 1);
          if ((nextIdx + 1) % 2 === 0) nextMoveNumber++;
          setStartBoardMoveNumber(nextMoveNumber);
          if (checkMovesLimit(nextMoveNumber)) return false;
        } else {
          setShowMistakes(true);
        }
        setPendingComputerMove(null);
        return true;
      } else {
        setIsCorrect(false);
        setBoardHighlight("red");
        if (!mistakes.includes(currentMoveIndex)) {
          setMistakes((prev) => [...prev, currentMoveIndex]);
        }
        setTimeout(() => setBoardHighlight(null), 800);
        game.undo();
        setGame(new Chess(game.fen()));
        return false;
      }
    }

    // Standardowa logika
    const moveSan = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!moveSan) {
      // Nielegalny ruch: po prostu nie pozwól wykonać
      return false;
    }
    // Sprawdź czy currentMoveIndex jest w granicach analizy
    if (!currentExercise.analysis[currentMoveIndex]) {
      
      return false;
    }
    const expectedMove = currentExercise.analysis[currentMoveIndex].move;
    if (moveSan.san === expectedMove) {
      setGame(new Chess(game.fen()));
      setCurrentMoveIndex((prev) => prev + 1);
      setIsCorrect(true);
      setBoardHighlight(null);
      let nextMoveNumber = startBoardMoveNumber;
      if ((currentMoveIndex + 1) % 2 === 0) nextMoveNumber++;
      setStartBoardMoveNumber(nextMoveNumber);
      if (checkMovesLimit(nextMoveNumber)) return false;
      // Ustawiam pendingComputerMove, żeby obsłużyć premove
      setPendingComputerMove("pending");
      setTimeout(() => {
        const nextIdx = currentMoveIndex + 1;
        if (nextIdx < currentExercise.analysis.length) {
          const nextMove = currentExercise.analysis[nextIdx].move;
          // Jeśli nextMove to wynik partii, nie wykonuj ruchu
          if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
            setShowMistakes(true);
            setPendingComputerMove(null);
            if (isRandomMode) {
              setTimeout(() => {
                loadRandomExercise();
              }, 1200);
            }
            return false;
          }
          const newGame = new Chess(game.fen());
          newGame.move(nextMove);
          setGame(newGame);
          setCurrentMoveIndex(nextIdx + 1);
          if ((nextIdx + 1) % 2 === 0) nextMoveNumber++;
          setStartBoardMoveNumber(nextMoveNumber);
          if (checkMovesLimit(nextMoveNumber)) return false;
        } else {
          setShowMistakes(true);
        }
        setPendingComputerMove(null);
      }, 500);
      return true;
    } else {
      setIsCorrect(false);
      setBoardHighlight("red");
      if (!mistakes.includes(currentMoveIndex)) {
        setMistakes((prev) => [...prev, currentMoveIndex]);
      }
      setTimeout(() => setBoardHighlight(null), 800);
      // Cofnij ruch
      game.undo();
      setGame(new Chess(game.fen()));
      if (isRandomMode) {
        setTimeout(() => {
          loadRandomExercise();
        }, 1200);
      }
      return false;
    }
  };

  // Funkcja do automatycznego wykonywania ruchów startowych
  const autoPlayStartingMoves = useCallback((exercise: Exercise, maxFullMoves: number, startFromIndex: number = 0) => {
    const chess = new Chess(exercise.initialFen);
    let idx = startFromIndex;
    let fullMoves = 0;
    
    // Wykonaj ruchy od określonego indeksu do limitu
    while (
      idx < exercise.analysis.length &&
      fullMoves < maxFullMoves
    ) {
      const move = exercise.analysis[idx]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) break;
      

      
      // Sprawdź czy ruch jest legalny przed wykonaniem
      try {
        const legalMoves = chess.moves({ verbose: true });
        const isLegal = legalMoves.some(m => m.san === move);
        
        if (isLegal) {
          chess.move(move);
          idx++;
          if (idx % 2 === 0) fullMoves++;

        } else {
          // Ruch nie jest legalny - zatrzymaj się tutaj
          console.warn(`Move ${move} is not legal at position ${chess.fen()}`);

          break;
        }
      } catch (error) {
        // Błąd podczas wykonywania ruchu - zatrzymaj się
        console.warn(`Error executing move ${move}:`, error);
        break;
      }
    }
    

    
    setGame(chess);
    setCurrentMoveIndex(idx);
    setAutoStartMoveIndex(idx);
    setStartBoardMoveNumber(Math.floor(idx / 2) + 1);
  }, []);

  const resetSession = (exercise: Exercise) => {
    setGame(new Chess(exercise.initialFen));
    setCurrentMoveIndex(0);
    setShowMistakes(false);
    setMistakes([]);
    setStartBoardMoveNumber(1);
    setIsCorrect(null);
    setShowSolution(false);
    setUserAnswer("");
    setBoardHighlight(null);
    setPendingComputerMove(null);
    setHistoryIndex(null);
    setPreHistoryTrainingIndex(null);
    // ...dodaj inne stany, które chcesz wyzerować
  };

  const loadExercise = (exercise: Exercise) => {

    setCurrentExercise(exercise);
    resetSession(exercise);
    setScore(0);
    setTotalMoves(exercise.analysis.length);
    setIsRandomMode(false);
    
    // Ustaw orientację szachownicy na podstawie ćwiczenia
    if (exercise.color === 'black' || exercise.id === 'KID-black') {

      setBoardOrientation('black');
      
      // Sprawdź czy pierwszy ruch należy do białych czy czarnych
      const chess = new Chess(exercise.initialFen);
      const firstMove = exercise.analysis[0]?.move;
      

      
      if (firstMove && !["0-1", "1-0", "*", "½-½"].includes(firstMove)) {
        // Sprawdź czy pierwszy ruch jest legalny dla białych
        if (isWhiteMove(chess, firstMove)) {
  
          // Pierwszy ruch należy do białych - wykonaj go automatycznie
          chess.move(firstMove);
          setGame(chess);
          setCurrentMoveIndex(1);
          setAutoStartMoveIndex(1);
          setStartBoardMoveNumber(1);
          
          // Sprawdź czy włączono automatyczne ruchy startowe
          if (autoStartingMoves) {
            const movesLimitNum = parseInt(autoMovesLimit);
            if (!isNaN(movesLimitNum) && movesLimitNum > 0) {
              // Kontynuuj automatyczne ruchy od pozycji po pierwszym ruchu białych
              const remainingMoves = movesLimitNum - 1; // Odejmujemy 1, bo już wykonaliśmy pierwszy ruch
              if (remainingMoves > 0) {
    
                autoPlayStartingMoves(
                  exercise,
                  remainingMoves,
                  1 // Startuj od indeksu 1 (po pierwszym ruchu białych)
                );
                return;
              }
            }
          }
        } else {
  
          // Pierwszy ruch należy do czarnych - użytkownik zaczyna
          setGame(chess);
          setCurrentMoveIndex(0);
          setAutoStartMoveIndex(0);
          setStartBoardMoveNumber(1);
          
          // Sprawdź czy włączono automatyczne ruchy startowe
          if (autoStartingMoves) {
            const movesLimitNum = parseInt(autoMovesLimit);
            if (!isNaN(movesLimitNum) && movesLimitNum > 0) {
  
              autoPlayStartingMoves(
                exercise,
                movesLimitNum,
                0 // Startuj od początku
              );
              return;
            }
          }
        }
      } else {

        // Brak ruchów lub nieprawidłowy ruch
        setGame(chess);
        setCurrentMoveIndex(0);
        setAutoStartMoveIndex(0);
        setStartBoardMoveNumber(1);
        
        // Sprawdź czy włączono automatyczne ruchy startowe
        if (autoStartingMoves) {
          const movesLimitNum = parseInt(autoMovesLimit);
          if (!isNaN(movesLimitNum) && movesLimitNum > 0) {

            autoPlayStartingMoves(
              exercise,
              movesLimitNum,
              0 // Startuj od początku
            );
            return;
          }
        }
      }
    } else {

      setBoardOrientation('white');
      // Automatyczne ruchy startowe (jeśli wybrano)
      if (autoStartingMoves) {
        const movesLimitNum = parseInt(autoMovesLimit);
        if (!isNaN(movesLimitNum) && movesLimitNum > 0) {

          autoPlayStartingMoves(
            exercise,
            movesLimitNum,
            0 // Startuj od początku
          );
          return;
        }
        // Jeśli limit to 0, po prostu nie rób nic (pozycja początkowa już ustawiona przez resetSession)
        return;
      }
    }
  };

  const loadRandomExercise = () => {
    if (exercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * exercises.length);
      setIsRandomMode(true);
      loadExercise(exercises[randomIndex]);
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setIsCorrect(false);
  };

  // --- VISION MODE LOGIC ---
  function getAttackedSquares(chess: Chess, color: 'w' | 'b') {
    const attacked: Record<string, number> = {};
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === color) {
          const from = String.fromCharCode(97 + c) + (8 - r);
          if (isValidSquare(from)) {
            const moves = chess.moves({ square: from as Square, verbose: true });
            for (const move of moves) {
              if (move.flags.includes('c') || move.flags.includes('a') || move.flags.includes('e') || move.flags.includes('q') || move.flags.includes('n') || move.flags.includes('b') || move.flags.includes('r') || move.flags.includes('k')) {
                // All moves are attacks except castling
                if (typeof move.to === 'string') {
                  attacked[move.to] = (attacked[move.to] || 0) + 1;
                }
              }
            }
          }
        }
      }
    }
    return attacked;
  }

  // Compute vision overlays
  const visionSquares: { [key in Square]?: React.CSSProperties } = useMemo(() => {
    if (!visionMode) return {};
    const fen = game.fen();
    const chessTmp = new Chess(fen);
    const whiteAttacks = getAttackedSquares(chessTmp, 'w');
    const blackAttacks = getAttackedSquares(chessTmp, 'b');
    const allSquares = Array.from(new Set([
      ...Object.keys(whiteAttacks),
      ...Object.keys(blackAttacks),
    ]));
    const result: { [key in Square]?: React.CSSProperties } = {};
    for (const sq of allSquares) {
      if (typeof sq === 'string' && isValidSquare(sq)) {
        const w = whiteAttacks[sq] || 0;
        const b = blackAttacks[sq] || 0;
        let r = 0, g = 0, bl = 0, a = 0.15;
        if (w > 0 && b === 0) {
          r = 255; g = 0; bl = 0; a = 0.13 + 0.13 * (w - 1);
        } else if (b > 0 && w === 0) {
          r = 0; g = 100; bl = 255; a = 0.13 + 0.13 * (b - 1);
        } else if (w > 0 && b > 0) {
          // Blend red and blue
          r = 180; g = 0; bl = 180; a = 0.18 + 0.10 * (w + b - 2);
        }
        if (w > 0 || b > 0) {
          result[sq as Square] = {
            background: `rgba(${r},${g},${bl},${Math.min(a,0.6)})`,
            boxShadow: '0 0 8px 2px rgba(0,0,0,0.08) inset',
          };
        }
      }
    }
    return result;
  }, [visionMode, game]);

  // Merge with hintSquares if both are active
  const customSquareStyles: { [key in Square]?: React.CSSProperties } = visionMode
    ? { ...hintSquares, ...visionSquares }
    : hintSquares;

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    setShowMistakes(false);
    setMistakes([]);
  }, [currentExercise]);

  return (
    <div className="w-full min-h-screen h-full relative bg-[#010706] overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] -left-[30%] w-[50rem] h-[45rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />
        <div className="absolute top-[-5%] right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />
        <div className="absolute top-[22%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>

      <main className="w-full flex flex-col !pt-[0rem] !pb-[2rem] !pl-[0rem] !pr-[0rem] box-border gap-[0.5rem] max-w-full mq1225:!pb-[2rem] mq1225:box-border mq450:gap-[0.3rem] mq450:!pb-[1rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[0.7rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[0.5rem] mq450:gap-[0.2rem]">
          <div className="w-full">
            <TopBar />
          </div>
          <div className="w-full px-1 mt-[-0.5rem]">
            <div className="flex flex-row gap-4 max-w-[1400px] mx-auto items-start">
              {/* Lewa kolumna - Lista ćwiczeń */}
              <ExerciseList
                exercises={exercises}
                currentExercise={currentExercise}
                onSelect={loadExercise}
              />

              {/* Środkowa kolumna - Szachownica */}
              <div className="flex flex-col items-center">
                <TrainingBoard
                  fen={game.fen()}
                  boardHighlight={boardHighlight}
                  onPieceDrop={onPieceDrop}
                  hintSquares={customSquareStyles}
                  boardOrientation={boardOrientation}
                  mistakes={mistakes}
                  currentMoveIndex={currentMoveIndex}
                  currentExercise={currentExercise}
                />
              </div>

              {/* Prawa kolumna - Fiszki z błędami i panele */}
              <RightPanel
                userMaxMoves={userMaxMoves}
                setUserMaxMoves={setUserMaxMoves}
                autoStartingMoves={autoStartingMoves}
                setAutoStartingMoves={setAutoStartingMoves}
                autoMovesLimit={autoMovesLimit}
                setAutoMovesLimit={setAutoMovesLimit}
                hintMode={hintMode}
                setHintMode={setHintMode}
                visionMode={visionMode}
                setVisionMode={fn => setVisionMode(fn)}
                showMistakes={showMistakes}
                mistakes={mistakes}
                currentExercise={currentExercise}
                setCurrentMoveIndex={setCurrentMoveIndex}
                setShowMistakes={setShowMistakes}
                setMistakes={setMistakes}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                historyIndex={historyIndex}
                currentMoveIndex={currentMoveIndex}
                onGoToMove={(idx) => {
                  if (!currentExercise) return;
                  const moveIdx = Math.min((idx + 1) * 2, currentExercise.analysis.length);
                  goToHistoryIndex(moveIdx);
                }}
              />
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default TrainingPage;

"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess, Square } from "chess.js";
import TopBar from "./topbar";
import { getExercises, Exercise } from "../utils/exercises";
import ExerciseList from "./ExerciseList";
import TrainingBoard from "./TrainingBoard";
import RightPanel from "./RightPanel";
import { getVisionOverlays } from "./VisionMode";

const TrainingContainer: React.FC = () => {
  const [fen, setFen] = useState(new Chess().fen());
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
  const [boardHighlight, setBoardHighlight] = useState<string | null>(null);
  const [hintMode, setHintMode] = useState(false);
  const [pendingComputerMove, setPendingComputerMove] = useState<string | null>(null);
  const [userMaxMoves, setUserMaxMoves] = useState<string>("");
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [autoStartingMoves, setAutoStartingMoves] = useState(false);
  const [autoMovesLimit, setAutoMovesLimit] = useState('3');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [preHistoryTrainingIndex, setPreHistoryTrainingIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [visionMode, setVisionMode] = useState(false);
  const boardRef = useRef<any>(null);
  const currentMoveIndexRef = useRef(currentMoveIndex);
  const historyIndexRef = useRef(historyIndex);
  const lastHistoryChangeRef = useRef(0);
  const HISTORY_COOLDOWN = 50; // ms

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
    return legalMoves.some(m => m.san === moveSan);
  };

  // Pobieranie ćwiczeń z API
  const fetchExercises = async () => {
    setExercises(getExercises());
  };

  useEffect(() => {
    currentMoveIndexRef.current = currentMoveIndex;
    historyIndexRef.current = historyIndex;
  }, [currentMoveIndex, historyIndex]);

  const goToHistoryIndex = useCallback((idx: number) => {
    if (!currentExercise) return;
    const chess = new Chess(currentExercise.initialFen);
    for (let i = 0; i < idx; i++) {
      const move = currentExercise.analysis[i]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) break;
      chess.move(move);
    }
    setFen(chess.fen());
    setCurrentMoveIndex(idx);
    setHistoryIndex(idx);
  }, [currentExercise]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastHistoryChangeRef.current < HISTORY_COOLDOWN) return;
      lastHistoryChangeRef.current = now;
      if (!currentExercise) return;
      if (e.key === "ArrowLeft") {
        if (historyIndexRef.current === null) {
          setPreHistoryTrainingIndex(currentMoveIndexRef.current);
          if (currentMoveIndexRef.current > 0) goToHistoryIndex(currentMoveIndexRef.current - 1);
        } else if (historyIndexRef.current > 0) {
          goToHistoryIndex(historyIndexRef.current - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (historyIndexRef.current !== null && historyIndexRef.current < currentExercise.analysis.length) {
          goToHistoryIndex(historyIndexRef.current + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentExercise, goToHistoryIndex]);

  // Obsługa ruchu na szachownicy
  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string): boolean => {
    if (historyIndex !== null && currentExercise) {
      // wróć do trybu treningowego
      const idx = preHistoryTrainingIndex ?? currentExercise.analysis.length;
      goToHistoryIndex(idx);
      setHistoryIndex(null);
      setPreHistoryTrainingIndex(null);
      return false;
    }
    if (!currentExercise) return false;
    // Jeśli ustawiono userMaxMoves, nie pozwól na dalsze ruchy po osiągnięciu limitu
    const maxMovesNum = parseInt(userMaxMoves) * 2;
    if (!isNaN(maxMovesNum) && maxMovesNum > 0 && currentMoveIndex >= maxMovesNum) {
      setShowMistakes(true);
      return false;
    }
    // Sprawdź, czy ruch jest legalny zanim wywołasz move
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });
    const isLegal = legalMoves.some(m => m.from === sourceSquare && m.to === targetSquare);
    if (!isLegal) return false;

    // Jeśli komputer ma wykonać ruch, a użytkownik już wykonał swój (premove)
    if (pendingComputerMove) {
      const moveSan = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
      if (!moveSan) return false;
      const expectedMove = currentExercise.analysis[currentMoveIndex].move;
      if (moveSan.san === expectedMove) {
        setFen(chess.fen());
        setCurrentMoveIndex((prev) => prev + 1);
        setIsCorrect(true);
        setBoardHighlight(null);
        // Wykonaj natychmiast ruch komputera
        const nextIdx = currentMoveIndex + 1;
        if (nextIdx < currentExercise.analysis.length) {
          const nextMove = currentExercise.analysis[nextIdx].move;
          if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
            setShowMistakes(true);
            setPendingComputerMove(null);
            return false;
          }
          chess.move(nextMove);
          setFen(chess.fen());
          setCurrentMoveIndex(nextIdx + 1);
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
        chess.undo();
        setFen(chess.fen());
        return false;
      }
    }

    // Standardowa logika
    const moveSan = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!moveSan) {
      return false;
    }
    if (!currentExercise.analysis[currentMoveIndex]) {
      
      return false;
    }
    const expectedMove = currentExercise.analysis[currentMoveIndex].move;
    if (moveSan.san === expectedMove) {
      setFen(chess.fen());
      setCurrentMoveIndex((prev) => prev + 1);
      setIsCorrect(true);
      setBoardHighlight(null);
      setPendingComputerMove("pending");
      setTimeout(() => {
        const nextIdx = currentMoveIndex + 1;
        if (nextIdx < currentExercise.analysis.length) {
          const nextMove = currentExercise.analysis[nextIdx].move;
          if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
            setShowMistakes(true);
            setPendingComputerMove(null);
            return false;
          }
          chess.move(nextMove);
          setFen(chess.fen());
          setCurrentMoveIndex(nextIdx + 1);
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
      chess.undo();
      setFen(chess.fen());
      return false;
    }
  };

  // Funkcja do automatycznego wykonywania ruchów startowych
  const autoPlayStartingMoves = useCallback((exercise: Exercise, maxFullMoves: number, startFromIndex: number = 0) => {
    
    const chess = new Chess(exercise.initialFen);
    let idx = 0;
    let fullMoves = 0;
    

    
    // Najpierw wykonaj ruchy do startFromIndex
    while (idx < startFromIndex && idx < exercise.analysis.length) {
      const move = exercise.analysis[idx]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) break;
      
      try {
        chess.move(move);
        idx++;

      } catch (error) {
        console.warn(`Error pre-executing move ${move}:`, error);
        break;
      }
    }
    

    
    // Teraz wykonaj automatyczne ruchy od startFromIndex do limitu pełnych ruchów
    while (
      idx < exercise.analysis.length &&
      fullMoves < maxFullMoves
    ) {
      const move = exercise.analysis[idx]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) {

        break;
      }
      

      
      // Sprawdź czy ruch jest legalny przed wykonaniem
      try {
        const legalMoves = chess.moves({ verbose: true });
        const isLegal = legalMoves.some(m => m.san === move);
        

        
        if (isLegal) {
          chess.move(move);
          idx++;
          if (idx % 2 === 0) fullMoves++; // Liczy pełne ruchy (białe + czarne)

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
    

    
    setFen(chess.fen());
    setCurrentMoveIndex(idx);
  }, []);

  const loadExercise = (exercise: Exercise) => {
    
    setCurrentExercise(exercise);
    setFen(new Chess(exercise.initialFen).fen());
    setCurrentMoveIndex(0);
    setShowSolution(false);
    setIsCorrect(null);
    setUserAnswer("");
    setScore(0);
    setTotalMoves(exercise.analysis.length);
    
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
          setFen(chess.fen());
          setCurrentMoveIndex(1);
          
          // Sprawdź czy włączono automatyczne ruchy startowe
          if (autoStartingMoves) {
            const movesLimitNum = parseInt(autoMovesLimit);
            if (!isNaN(movesLimitNum) && movesLimitNum > 0) {
              // Kontynuuj automatyczne ruchy od pozycji po pierwszym ruchu białych
              // Używamy pełnej liczby ruchów, bo funkcja autoPlayStartingMoves teraz liczy pełne ruchy

              autoPlayStartingMoves(
                exercise,
                movesLimitNum,
                1 // Startuj od indeksu 1 (po pierwszym ruchu białych)
              );
              return;
            }
          }
        } else {

          // Pierwszy ruch należy do czarnych - użytkownik zaczyna
          setFen(chess.fen());
          setCurrentMoveIndex(0);
          
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
        setFen(chess.fen());
        setCurrentMoveIndex(0);
        
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
        return;
      }
    }
  };

  const loadRandomExercise = () => {
    if (exercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * exercises.length);
      loadExercise(exercises[randomIndex]);
    }
  };

  // Vision overlays
  const visionSquares = useMemo(() => visionMode ? getVisionOverlays(new Chess(fen), 'both') : {}, [visionMode, fen]);

  // HINT MODE: podświetlenie pola figury do ruszenia
  const hintSquares = useMemo(() => {
    if (!(hintMode && currentExercise && currentMoveIndex < currentExercise.analysis.length)) return {};
    const chessTmp = new Chess(fen);
    const currentAnalysis = currentExercise.analysis[currentMoveIndex];
    if (!currentAnalysis) return {};
    const moveSan = currentAnalysis.move;
    const legalMoves = chessTmp.moves({ verbose: true });
    const correctMove = legalMoves.find((m) => m.san === moveSan);
    if (correctMove && typeof correctMove.from === 'string' && isValidSquare(correctMove.from)) {
      return { [correctMove.from]: { background: 'rgba(36,245,228,0.5)' } };
    }
    return {};
  }, [hintMode, currentExercise, currentMoveIndex, fen]);

  // Merge overlays: hint overlays only override the relevant squares, vision overlays everywhere else
  const mergedOverlays = useMemo(() => ({ ...visionSquares, ...hintSquares }), [visionSquares, hintSquares]);

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <div className="w-full relative bg-[#010706] overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] -left-[30%] w-[50rem] h-[45rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />
        <div className="absolute top-[-5%] right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />
        <div className="absolute top-[22%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>

      <main className="w-full flex flex-col !pt-[0rem] !pb-[10rem] !pl-[0rem] !pr-[0rem] box-border gap-[1.2rem] max-w-full mq1225:!pb-[4rem] mq1225:box-border mq450:gap-[0.7rem] mq450:!pb-[2rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[1.5rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[1rem] mq450:gap-[0.5rem]">
          <div className="w-full">
            <TopBar />
          </div>
          <div className="w-full px-1">
            <div className="flex flex-row gap-4 max-w-[1400px] mx-auto">
                             <ExerciseList
                 exercises={exercises}
                 currentExercise={currentExercise}
                 onSelect={loadExercise}
               />
              <TrainingBoard
                fen={fen}
                boardHighlight={boardHighlight}
                onPieceDrop={onPieceDrop}
                hintSquares={mergedOverlays}
                boardOrientation={boardOrientation}
                mistakes={mistakes}
                currentMoveIndex={currentMoveIndex}
                currentExercise={currentExercise}
              />
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
              />
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default TrainingContainer; 
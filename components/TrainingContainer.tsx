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
  const [fixedMistakes, setFixedMistakes] = useState<number[]>([]);
  const [showMistakes, setShowMistakes] = useState(false);
  const [currentMistakeIndex, setCurrentMistakeIndex] = useState(0);
  const [reviewingMistakes, setReviewingMistakes] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<{[key: string]: {completed: number, attempted: number}}>({});
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

  const onGoToMove = useCallback((moveIdx: number) => {
    goToHistoryIndex(moveIdx);
  }, [goToHistoryIndex]);

  // Obsługa ruchu z tekstu (MoveInput)
  const onMoveInput = useCallback((moveText: string): boolean => {
    if (!currentExercise || reviewingMistakes) return false;
    
    const chess = new Chess(fen);
    try {
      const move = chess.move(moveText);
      if (!move) return false;
      
      // Sprawdź czy ruch jest poprawny
      const expectedMove = currentExercise.analysis[currentMoveIndex]?.move;
      if (move.san === expectedMove) {
        setFen(chess.fen());
        setCurrentMoveIndex((prev) => prev + 1);
        setIsCorrect(true);
        setBoardHighlight("green");
        setTimeout(() => setBoardHighlight(null), 500);
        setPendingComputerMove("pending");
        
        setTimeout(() => {
          const nextIdx = currentMoveIndex + 1;
          // Sprawdź czy był to błąd, który teraz naprawiliśmy (tylko w trybie review)
          if (reviewingMistakes && mistakes.includes(currentMoveIndex) && !fixedMistakes.includes(currentMoveIndex)) {
            setFixedMistakes((prev) => [...prev, currentMoveIndex]);
            // Przejdź do następnego błędu
            const nextMistakeIdx = currentMistakeIndex + 1;
            if (nextMistakeIdx < mistakes.length) {
              setCurrentMistakeIndex(nextMistakeIdx);
              const nextMistake = mistakes[nextMistakeIdx];
              const chessTemp = new Chess(currentExercise.initialFen);
              for (let i = 0; i < nextMistake; i++) {
                chessTemp.move(currentExercise.analysis[i].move);
              }
              setFen(chessTemp.fen());
              setCurrentMoveIndex(nextMistake);
              setPendingComputerMove(null);
              return;
            } else {
              // Wszystkie błędy naprawione
              setReviewingMistakes(false);
              setCurrentMistakeIndex(0);
              setFixedMistakes([]);
              setMistakes([]);
              setExerciseResults(prev => ({
                ...prev,
                [currentExercise.id]: {
                  completed: 1,
                  attempted: 1
                }
              }));
              setPendingComputerMove(null);
              return;
            }
          }
          
          if (nextIdx < currentExercise.analysis.length) {
            const nextMove = currentExercise.analysis[nextIdx].move;
            if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
              setExerciseResults(prev => ({
                ...prev,
                [currentExercise.id]: {
                  completed: 0,
                  attempted: 1
                }
              }));
              setPendingComputerMove(null);
              return false;
            }
            chess.move(nextMove);
            setFen(chess.fen());
            setCurrentMoveIndex(nextIdx + 1);
          } else {
            setExerciseResults(prev => ({
              ...prev,
              [currentExercise.id]: {
                completed: 0,
                attempted: 1
              }
            }));
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
        setFixedMistakes((prev) => prev.filter(m => m !== currentMoveIndex));
        setTimeout(() => setBoardHighlight(null), 800);
        return false;
      }
    } catch (err) {
      return false;
    }
  }, [fen, currentExercise, currentMoveIndex, reviewingMistakes, mistakes, fixedMistakes, currentMistakeIndex]);

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
      // Zapisz wynik - dotarliśmy do końca
      if (currentExercise) {
        // Sprawdź czy automatyczne ruchy pokrywały cały limit
        const autoLimitNum = autoStartingMoves ? parseInt(autoMovesLimit) * 2 : 0;
        const noErrorsPossible = autoLimitNum >= maxMovesNum;
        
        setExerciseResults(prev => ({
          ...prev,
          [currentExercise.id]: {
            completed: 0, // Nie poprawiliśmy jeszcze błędów (lub nie było co poprawiać)
            attempted: 1
          }
        }));
      }
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
            // Dotarliśmy do końca - zapisz wynik
            setExerciseResults(prev => ({
              ...prev,
              [currentExercise.id]: {
                completed: 0, // Nie poprawiliśmy jeszcze błędów
                attempted: 1
              }
            }));
            setPendingComputerMove(null);
            return false;
          }
          chess.move(nextMove);
          setFen(chess.fen());
          setCurrentMoveIndex(nextIdx + 1);
        } else {
          // Dotarliśmy do końca
          const perfect = mistakes.length === 0;
          setExerciseResults(prev => ({
            ...prev,
            [currentExercise.id]: {
              completed: perfect ? 1 : 0,
              attempted: 1
            }
          }));
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
        // Sprawdź czy był to błąd, który teraz naprawiliśmy
        if (reviewingMistakes && mistakes.includes(currentMoveIndex) && !fixedMistakes.includes(currentMoveIndex)) {
          setFixedMistakes((prev) => [...prev, currentMoveIndex]);
          // Przejdź do następnego błędu
          const nextMistakeIdx = currentMistakeIndex + 1;
          if (nextMistakeIdx < mistakes.length) {
            setCurrentMistakeIndex(nextMistakeIdx);
            const nextMistake = mistakes[nextMistakeIdx];
            const chessTemp = new Chess(currentExercise.initialFen);
            for (let i = 0; i < nextMistake; i++) {
              chessTemp.move(currentExercise.analysis[i].move);
            }
            setFen(chessTemp.fen());
            setCurrentMoveIndex(nextMistake);
            setPendingComputerMove(null);
            return;
          } else {
            // Wszystkie błędy naprawione
            setReviewingMistakes(false);
            setCurrentMistakeIndex(0);
            setFixedMistakes([]);
            setMistakes([]);
            // Oznacz jako completed
            setExerciseResults(prev => ({
              ...prev,
              [currentExercise.id]: {
                completed: 1,
                attempted: 1
              }
            }));
            setPendingComputerMove(null);
            return;
          }
        }
        if (nextIdx < currentExercise.analysis.length) {
          const nextMove = currentExercise.analysis[nextIdx].move;
          if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
            // Dotarliśmy do końca - zapisz wynik
            setExerciseResults(prev => ({
              ...prev,
              [currentExercise.id]: {
                completed: 0, // Nie poprawiliśmy jeszcze błędów
                attempted: 1
              }
            }));
            setPendingComputerMove(null);
            return false;
          }
          chess.move(nextMove);
          setFen(chess.fen());
          setCurrentMoveIndex(nextIdx + 1);
        } else {
          // Dotarliśmy do końca
          const perfect = mistakes.length === 0;
          setExerciseResults(prev => ({
            ...prev,
            [currentExercise.id]: {
              completed: perfect ? 1 : 0,
              attempted: 1
            }
          }));
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
      // Usuń z fixedMistakes jeśli był tam
      setFixedMistakes((prev) => prev.filter(m => m !== currentMoveIndex));
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

  const startMistakeReview = useCallback(() => {
    if (!currentExercise || mistakes.length === 0) return;
    setReviewingMistakes(true);
    setCurrentMistakeIndex(0);
    setFixedMistakes([]);
    // Wyłącz historię gdy włączamy mistakes review
    setShowHistory(false);
    setHistoryIndex(null);
    setPreHistoryTrainingIndex(null);
    const firstMistake = mistakes[0];
    const chess = new Chess(currentExercise.initialFen);
    for (let i = 0; i < firstMistake; i++) {
      chess.move(currentExercise.analysis[i].move);
    }
    setFen(chess.fen());
    setCurrentMoveIndex(firstMistake);
  }, [currentExercise, mistakes]);

  const loadExercise = (exercise: Exercise) => {
    
    setCurrentExercise(exercise);
    setFen(new Chess(exercise.initialFen).fen());
    setCurrentMoveIndex(0);
    setShowSolution(false);
    setIsCorrect(null);
    setUserAnswer("");
    setScore(0);
    setTotalMoves(exercise.analysis.length);
    setMistakes([]);
    setFixedMistakes([]);
    setShowMistakes(false);
    setReviewingMistakes(false);
    setCurrentMistakeIndex(0);
    
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
      // Deterministic random selection based on current time (rounded to seconds)
      const timeBasedIndex = Math.floor(Date.now() / 1000) % exercises.length;
      loadExercise(exercises[timeBasedIndex]);
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

  // Automatycznie wyłącz historię gdy włączamy mistakes review
  useEffect(() => {
    if (reviewingMistakes && showHistory) {
      setShowHistory(false);
      setHistoryIndex(null);
      setPreHistoryTrainingIndex(null);
    }
  }, [reviewingMistakes, showHistory]);

  return (
    <div className="w-full relative bg-[#010706] overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal] min-h-screen">
      {/* Elipsy w tle w kolorze cyan */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full" style={{ width: '120px', height: '120px', left: '5%', top: '25%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.2) 0%, rgba(36,245,228,0.15) 25%, rgba(36,245,228,0.08) 50%, rgba(36,245,228,0.03) 70%, transparent 85%)', filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute rounded-full" style={{ width: '150px', height: '150px', left: '95%', top: '30%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.18) 0%, rgba(36,245,228,0.12) 25%, rgba(36,245,228,0.06) 50%, rgba(36,245,228,0.02) 70%, transparent 85%)', filter: 'blur(90px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute rounded-full" style={{ width: '100px', height: '100px', left: '15%', top: '75%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.16) 0%, rgba(36,245,228,0.10) 25%, rgba(36,245,228,0.05) 50%, rgba(36,245,228,0.02) 70%, transparent 85%)', filter: 'blur(75px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute rounded-full" style={{ width: '130px', height: '130px', left: '85%', top: '80%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.19) 0%, rgba(36,245,228,0.13) 25%, rgba(36,245,228,0.07) 50%, rgba(36,245,228,0.02) 70%, transparent 85%)', filter: 'blur(85px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute rounded-full" style={{ width: '110px', height: '110px', left: '50%', top: '10%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.17) 0%, rgba(36,245,228,0.11) 25%, rgba(36,245,228,0.06) 50%, rgba(36,245,228,0.02) 70%, transparent 85%)', filter: 'blur(78px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute rounded-full" style={{ width: '140px', height: '140px', left: '3%', top: '55%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.21) 0%, rgba(36,245,228,0.14) 25%, rgba(36,245,228,0.07) 50%, rgba(36,245,228,0.02) 70%, transparent 85%)', filter: 'blur(88px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute rounded-full" style={{ width: '125px', height: '125px', left: '97%', top: '60%', background: 'radial-gradient(circle at 30% 30%, rgba(36,245,228,0.18) 0%, rgba(36,245,228,0.12) 25%, rgba(36,245,228,0.06) 50%, rgba(36,245,228,0.02) 70%, transparent 85%)', filter: 'blur(82px)', transform: 'translate(-50%, -50%)' }} />
      </div>
      <main className="w-full flex flex-col !pt-[0rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border gap-[1.2rem] max-w-full" style={{ position: 'relative', zIndex: 1 }}>
        <main className="w-full flex flex-col gap-4 max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-4 mq450:gap-4">
          <div className="w-full">
            <TopBar />
          </div>
          <div className="w-full px-1">
            <div className="flex flex-row justify-center items-start gap-4 max-w-[1400px] mx-auto">
                             <ExerciseList
                 exercises={exercises}
                 currentExercise={currentExercise}
                 onSelect={loadExercise}
                 exerciseResults={exerciseResults}
               />
              <div className="flex flex-col items-center justify-center">
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
              </div>
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
                fixedMistakes={fixedMistakes}
                reviewingMistakes={reviewingMistakes}
                exerciseResults={exerciseResults}
                onStartMistakeReview={startMistakeReview}
                currentExercise={currentExercise}
                setCurrentMoveIndex={setCurrentMoveIndex}
                setShowMistakes={setShowMistakes}
                setMistakes={setMistakes}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                historyIndex={historyIndex}
                currentMoveIndex={currentMoveIndex}
                fen={fen}
                onMoveInput={onMoveInput}
                onGoToMove={onGoToMove}
              />
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default TrainingContainer; 
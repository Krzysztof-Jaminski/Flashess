"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import TopBar from "./topbar";
import { getExercises, Exercise } from "../utils/exercises";
import ExerciseList from "./ExerciseList";
import TrainingBoard from "./TrainingBoard";
import RightPanel from "./RightPanel";

const TrainingContainer: React.FC = () => {
  const [game, setGame] = useState(new Chess());
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
  const boardRef = useRef<any>(null);

  // Pobieranie ćwiczeń z API
  const fetchExercises = async () => {
    setExercises(getExercises());
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
        if (nextIdx < currentExercise.analysis.length) {
          const nextMove = currentExercise.analysis[nextIdx].move;
          // Jeśli nextMove to wynik partii, nie wykonuj ruchu
          if (["0-1", "1-0", "*", "½-½"].includes(nextMove)) {
            setShowMistakes(true);
            setPendingComputerMove(null);
            return false;
          }
          const newGame = new Chess(game.fen());
          newGame.move(nextMove);
          setGame(newGame);
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
      console.warn('currentMoveIndex out of bounds:', currentMoveIndex, 'analysis length:', currentExercise.analysis.length);
      return false;
    }
    
    const expectedMove = currentExercise.analysis[currentMoveIndex].move;
    if (moveSan.san === expectedMove) {
      setGame(new Chess(game.fen()));
      setCurrentMoveIndex((prev) => prev + 1);
      setIsCorrect(true);
      setBoardHighlight(null);
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
            return false;
          }
          const newGame = new Chess(game.fen());
          newGame.move(nextMove);
          setGame(newGame);
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
      // Cofnij ruch
      game.undo();
      setGame(new Chess(game.fen()));
      return false;
    }
  };

  // Funkcja do automatycznego wykonywania ruchów startowych
  const autoPlayStartingMoves = useCallback((exercise: Exercise, maxMoves: number) => {
    const chess = new Chess(exercise.initialFen);
    let idx = 0;
    while (
      idx < exercise.analysis.length &&
      idx < maxMoves
    ) {
      const move = exercise.analysis[idx]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) break;
      chess.move(move);
      idx++;
    }
    // Sprawdź, czy na ruchu jest gracz (czyli użytkownik)
    // Gracz to ten, kto zaczyna ćwiczenie (white, chyba że boardOrientation=black)
    let userColor: 'w' | 'b' = 'w';
    if (exercise.id === 'KID-black') userColor = 'b';
    if (chess.turn() !== userColor && idx < exercise.analysis.length) {
      // Wykonaj jeszcze jeden ruch, żeby na ruchu był gracz
      const move = exercise.analysis[idx]?.move;
      if (move && !["0-1", "1-0", "*", "½-½"].includes(move)) {
        chess.move(move);
        idx++;
      }
    }
    setGame(chess);
    setCurrentMoveIndex(idx);
  }, []);

  const loadExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setGame(new Chess(exercise.initialFen));
    setCurrentMoveIndex(0);
    setShowSolution(false);
    setIsCorrect(null);
    setUserAnswer("");
    setScore(0);
    setTotalMoves(exercise.analysis.length);
    // Ustaw orientację szachownicy
    if (exercise.id === 'KID-black') {
      setBoardOrientation('black');
      // Automatycznie wykonaj pierwszy ruch białych
      const chess = new Chess(exercise.initialFen);
      const firstMove = exercise.analysis[0]?.move;
      if (firstMove) {
        chess.move(firstMove);
        setGame(chess);
        setCurrentMoveIndex(1);
      }
    } else {
      setBoardOrientation('white');
      // Automatyczne ruchy startowe (jeśli wybrano)
      if (autoStartingMoves) {
        const movesLimitNum = parseInt(autoMovesLimit);
        if (!isNaN(movesLimitNum) && movesLimitNum > 0) {
          // Liczba pełnych ruchów (par: białe+czarne) -> liczba półruchów = movesLimitNum * 2
          const maxMovesNum = movesLimitNum * 2;
          autoPlayStartingMoves(
            exercise,
            maxMovesNum
          );
          return;
        }
        // Jeśli limit to 0, po prostu nie rób nic (pozycja początkowa już ustawiona)
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

  // HINT MODE: podświetlenie pola figury do ruszenia
  let hintSquares: { [square: string]: React.CSSProperties } = {};
  if (hintMode && currentExercise && currentMoveIndex < currentExercise.analysis.length) {
    const fen = game.fen();
    const chessTmp = new Chess(fen);
    const currentAnalysis = currentExercise.analysis[currentMoveIndex];
    if (currentAnalysis) {
      const moveSan = currentAnalysis.move;
      const legalMoves = chessTmp.moves({ verbose: true });
      const correctMove = legalMoves.find((m) => m.san === moveSan);
      if (correctMove) {
        hintSquares[correctMove.from] = { background: 'rgba(36,245,228,0.5)' };
      }
    }
  }

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
                onRandom={loadRandomExercise}
              />
              <TrainingBoard
                game={game}
                boardHighlight={boardHighlight}
                onPieceDrop={onPieceDrop}
                hintSquares={hintSquares}
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
                showMistakes={showMistakes}
                mistakes={mistakes}
                currentExercise={currentExercise}
                setGame={setGame}
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
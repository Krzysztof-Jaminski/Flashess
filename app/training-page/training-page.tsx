"use client";
import type { NextPage } from "next";
import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
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
  const boardRef = useRef<any>(null);

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
  const autoPlayStartingMoves = useCallback((exercise: Exercise, maxFullMoves: number) => {
    const chess = new Chess(exercise.initialFen);
    let idx = 0;
    let fullMoves = 0;
    while (
      idx < exercise.analysis.length &&
      (maxFullMoves === 0 || fullMoves < maxFullMoves)
    ) {
      const move = exercise.analysis[idx]?.move;
      if (!move || ["0-1", "1-0", "*", "½-½"].includes(move)) break;
      chess.move(move);
      idx++;
      if (idx % 2 === 0) fullMoves++;
    }
    // Sprawdź, czy na ruchu jest gracz (czyli użytkownik)
    let userColor: 'w' | 'b' = 'w';
    if (exercise.id === 'KID-black') userColor = 'b';
    if (chess.turn() !== userColor && idx < exercise.analysis.length) {
      const move = exercise.analysis[idx]?.move;
      if (move && !["0-1", "1-0", "*", "½-½"].includes(move)) {
        chess.move(move);
        idx++;
      }
    }
    setGame(chess);
    setCurrentMoveIndex(idx);
    setAutoStartMoveIndex(idx);
    setStartBoardMoveNumber(Math.floor(idx / 2) + 1);
  }, []);

  const loadExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setGame(new Chess(exercise.initialFen));
    setCurrentMoveIndex(0);
    setAutoStartMoveIndex(0);
    setStartBoardMoveNumber(1);
    setShowSolution(false);
    setIsCorrect(null);
    setUserAnswer("");
    setScore(0);
    setTotalMoves(exercise.analysis.length);
    setShowMistakes(false);
    setMistakes([]);
    setIsRandomMode(false);
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
        setAutoStartMoveIndex(1);
        setStartBoardMoveNumber(1);
      }
    } else {
      setBoardOrientation('white');
      // Automatyczne ruchy startowe (jeśli wybrano)
      if (autoStartingMoves) {
        const movesLimitNum = parseInt(autoMovesLimit);
        const maxFullMovesNum = !isNaN(movesLimitNum) && movesLimitNum > 0 ? movesLimitNum : 0;
        autoPlayStartingMoves(
          exercise,
          maxFullMovesNum
        );
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

  // HINT MODE: podświetlenie pola figury do ruszenia
  let hintSquares: { [square: string]: React.CSSProperties } = {};
  if (hintMode && currentExercise && currentMoveIndex < currentExercise.analysis.length) {
    const fen = game.fen();
    const chessTmp = new Chess(fen);
    const moveSan = currentExercise.analysis[currentMoveIndex].move;
    const legalMoves = chessTmp.moves({ verbose: true });
    const correctMove = legalMoves.find((m) => m.san === moveSan);
    if (correctMove) {
      hintSquares[correctMove.from] = { background: 'rgba(36,245,228,0.5)' };
    }
  }

  // Renderowanie listy zagranych ruchów
  const renderMoveList = () => {
    if (!currentExercise) return null;
    if (!showHistory) return (
      <div className="flex items-center gap-2 mt-2 mb-1">
        <Buttons
          bUTTON={showHistory ? "ON" : "OFF"}
          onLogInButtonContainerClick={() => setShowHistory(true)}
          className={`!py-1 !px-3 !text-xs !rounded ${showHistory ? 'border-cyan-400 text-cyan-300' : ''}`}
        />
        {!showHistory && <span className="text-white/80 text-xs">Show history</span>}
      </div>
    );
    const moves = currentExercise.analysis.map(a => a.move).filter(m => !["0-1", "1-0", "*", "½-½"].includes(m));
    let out: string[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      const white = moves[i] || "";
      const black = moves[i + 1] || "";
      out.push(`${num}. ${white} ${black}`.trim());
    }
    return (
      <div className="bg-[rgba(36,245,228,0.08)] border border-[rgba(36,245,228,0.18)] rounded p-2 mt-2 text-xs text-white/80 max-h-64 overflow-y-auto custom-scrollbar">
        <div className="font-bold mb-1 flex items-center justify-between">
          <span>Move history</span>
          <div className="flex items-center gap-2">
            <Buttons
              bUTTON={showHistory ? "ON" : "OFF"}
              onLogInButtonContainerClick={() => setShowHistory(false)}
              className={`!py-1 !px-3 !text-xs !rounded ${showHistory ? 'border-cyan-400 text-cyan-300' : ''}`}
            />
            <span className="text-white/80 text-xs">Show history</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {out.map((line, idx) => (
            <span key={idx} className={historyIndex !== null && Math.floor(historyIndex/2) === idx ? "text-cyan-400 font-bold" : ""}>{line}</span>
          ))}
        </div>
        <div className="mt-1 text-white/50 text-xs">Use ←/→ arrows to browse history</div>
      </div>
    );
  };

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
                onRandom={loadRandomExercise}
              />

              {/* Środkowa kolumna - Szachownica */}
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

export default TrainingPage;

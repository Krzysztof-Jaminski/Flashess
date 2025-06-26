"use client";
import type { NextPage } from "next";
import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import TopBar from "../../components/topbar";
import Buttons from "../../components/buttons";
import type { Square } from "chess.js";
import { API_BASE_URL } from "../../utils/apiConfig";

interface PopularMove {
  move: string;
  winRate: number;
  drawRate: number;
  lossRate: number;
  evaluation: number;
}

interface AnalysisMove {
  move: string;
  evaluation: number;
  isCritical: boolean;
}

const CreationPage: NextPage = () => {
  const [game, setGame] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(700);
  const [popularMoves, setPopularMoves] = useState<PopularMove[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisMove[]>([]);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [boardHighlight, setBoardHighlight] = useState<string>("");
  const [criticalThreshold, setCriticalThreshold] = useState<number>(1.0);
  const [isStockfishMode, setIsStockfishMode] = useState(false);
  const [stockfishMoves, setStockfishMoves] = useState<string[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const boardRef = useRef<any>(null);

  const fetchPopularMoves = async (fen: string) => {
    try {
      const mockMoves: PopularMove[] = [
        {
          move: "e4",
          winRate: 45,
          drawRate: 35,
          lossRate: 20,
          evaluation: 0.3,
        },
        {
          move: "d4",
          winRate: 42,
          drawRate: 38,
          lossRate: 20,
          evaluation: 0.2,
        },
        {
          move: "Nf3",
          winRate: 40,
          drawRate: 40,
          lossRate: 20,
          evaluation: 0.1,
        },
        {
          move: "c4",
          winRate: 38,
          drawRate: 42,
          lossRate: 20,
          evaluation: 0.0,
        },
        {
          move: "g3",
          winRate: 35,
          drawRate: 45,
          lossRate: 20,
          evaluation: -0.1,
        },
      ];

      const sorted = mockMoves.sort(
        (a, b) => b.winRate + b.drawRate - (a.winRate + a.drawRate)
      );
      setPopularMoves(sorted);

      // Rzeczywiste API:
      // const response = await fetch(`${API_BASE_URL}/api/popular-moves`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ fen })
      // });
      // const data = await response.json();
      // setPopularMoves(data.moves.sort((a, b) => (b.winRate + b.drawRate) - (a.winRate + a.drawRate)));
    } catch (error) {
      console.error("Error fetching popular moves:", error);
    }
  };

  const checkPositionEvaluation = async (fen: string) => {
    try {
      const mockEvaluation = Math.random() * 2 - 1;
      return mockEvaluation;

      // const response = await fetch(`${API_BASE_URL}/api/evaluate-position`, {...})
      // return data.evaluation;
    } catch (error) {
      console.error("Error evaluating position:", error);
      return 0;
    }
  };

  const fetchStockfishMoves = async (fen: string) => {
    try {
      const mockMoves = ["e4", "d4", "Nf3", "c4", "g3"];
      return mockMoves;

      // const response = await fetch(`${API_BASE_URL}/api/stockfish-moves`, {...})
      // return data.moves;
    } catch (error) {
      console.error("Error fetching Stockfish moves:", error);
      return [];
    }
  };

  const saveExercise = async () => {
    try {
      const exerciseData = {
        name: exerciseName || "Exercise " + Date.now(),
        initialFen: game.fen(),
        analysis: analysis,
        createdAt: new Date().toISOString(),
      };
      console.log("Saving exercise:", exerciseData);
      alert("Exercise saved successfully!");

      // await fetch(`${API_BASE_URL}/api/save-exercise`, {...})
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert("Error saving exercise");
    }
  };

  const handleMoveSelect = async (move: string) => {
    setSelectedMove(move);
    const newGame = new Chess(game.fen());

    const legalMoves = newGame.moves({ verbose: true });
    const selected = legalMoves.find(
      (m) => m.san === move || m.from + m.to === move
    );

    if (!selected) {
      console.warn("Invalid move:", move);
      return;
    }

    newGame.move({ from: selected.from, to: selected.to, promotion: "q" });
    setGame(newGame);

    const evaluation = await checkPositionEvaluation(newGame.fen());
    const isCritical = Math.abs(evaluation) >= criticalThreshold;

    setAnalysis((prev) => [
      ...prev,
      {
        move,
        evaluation,
        isCritical,
      },
    ]);

    if (isCritical) {
      setBoardHighlight("rgba(135, 206, 250, 0.3)");
      setIsStockfishMode(true);
      const sfMoves = await fetchStockfishMoves(newGame.fen());
      setStockfishMoves(sfMoves);
    } else {
      setBoardHighlight("");
    }

    fetchPopularMoves(newGame.fen());
  };

  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };
    const newGame = new Chess(game.fen());
    const result = newGame.move(move);
    if (!result) return false;

    const algebraicMove = result.san;

    if (
      isStockfishMode &&
      !stockfishMoves.includes(algebraicMove) &&
      !stockfishMoves.includes(move.from + move.to)
    ) {
      setBoardHighlight("rgba(255, 0, 0, 0.3)");
      setTimeout(() => setBoardHighlight("rgba(135, 206, 250, 0.3)"), 1000);
      return false;
    }

    setGame(newGame);
    fetchPopularMoves(newGame.fen());
    return true;
  };

  const handleClearBoard = () => {
    setGame(new Chess());
    setAnalysis([]);
    setPopularMoves([]);
    setSelectedMove(null);
    setBoardHighlight("");
    setIsStockfishMode(false);
    setStockfishMoves([]);
    fetchPopularMoves(new Chess().fen());
  };

  useEffect(() => {
    const updateBoardWidth = () => {
      setBoardWidth(Math.min(700, window.innerWidth * 0.65));
    };
    updateBoardWidth();
    window.addEventListener("resize", updateBoardWidth);
    return () => window.removeEventListener("resize", updateBoardWidth);
  }, []);

  useEffect(() => {
    fetchPopularMoves(game.fen());
  }, []);

  return (
    <div className="w-full relative bg-[#010706] overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] -left-[30%] w-[50rem] h-[45rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />
        <div className="absolute top-[-5%] right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />
        <div className="absolute top-[22%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>

      <main className="w-full flex flex-col gap-[5rem] text-left text-[0.938rem] text-White font-['Russo_One']">
        <TopBar />

        <div className="w-full px-1">
          <div className="flex flex-row gap-4 max-w-[1400px] mx-auto">
            {/* Analiza */}
            <div className="w-[300px] bg-white/5 border border-white/30 rounded-lg p-4">
              <h3 className="text-lg text-cyan-300 mb-3">Analysis</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {analysis.map((move, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      move.isCritical
                        ? "bg-red-500/20 border border-red-500/50"
                        : "bg-white/10"
                    }`}
                  >
                    <div className="text-sm font-bold">
                      {index + 1}. {move.move}
                    </div>
                    <div className="text-xs text-white/70">
                      Eval: {move.evaluation.toFixed(2)}
                    </div>
                    {move.isCritical && (
                      <div className="text-xs text-red-400">
                        Critical position!
                      </div>
                    )}
                  </div>
                ))}
                {analysis.length === 0 && (
                  <div className="text-white/50 text-sm">
                    No moves analyzed yet
                  </div>
                )}
              </div>

              {analysis.length > 0 && (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="Exercise name"
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  />
                  <Buttons
                    bUTTON="Save Exercise"
                    onLogInButtonContainerClick={saveExercise}
                    className="w-full !py-2 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Szachownica */}
            <div className="flex-1 bg-white/5 border border-white/30 rounded-lg p-4 flex flex-col items-start justify-end">
              <div className="w-full aspect-square max-w-[480px] mt-10 ml-0" style={{ alignSelf: 'flex-start' }}>
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    border: boardHighlight
                      ? `3px solid ${boardHighlight}`
                      : "none",
                    borderRadius: "8px",
                    transition: "border 0.3s ease",
                  }}
                >
                  <Chessboard
                    ref={boardRef}
                    position={game.fen()}
                    boardWidth={boardWidth}
                    onPieceDrop={handlePieceDrop}
                    customBoardStyle={{
                      borderRadius: "4px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Buttons
                  bUTTON="Clear Board"
                  onLogInButtonContainerClick={handleClearBoard}
                  className="!py-1 !px-3 text-sm"
                />
              </div>
            </div>

            {/* Opening Tree */}
            <div className="w-[300px] bg-white/5 border border-white/30 rounded-lg p-4">
              <h3 className="text-lg text-cyan-300 mb-3">Opening Tree</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-white/80 text-sm">
                    Critical threshold:
                  </label>
                  <input
                    type="number"
                    value={criticalThreshold}
                    onChange={(e) =>
                      setCriticalThreshold(parseFloat(e.target.value))
                    }
                    step="0.1"
                    min="0"
                    className="w-16 bg-white/10 border border-white/20 rounded px-1 py-1 text-white text-sm"
                  />
                </div>

                {popularMoves.map((move, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedMove === move.move
                        ? "bg-cyan-400/30 border border-cyan-400/50"
                        : "bg-white/10 hover:bg-white/15"
                    }`}
                    onClick={() => handleMoveSelect(move.move)}
                  >
                    <div className="text-sm font-bold">{move.move}</div>
                    <div className="text-xs text-white/70">
                      Win: {move.winRate}% | Draw: {move.drawRate}% | Loss:{" "}
                      {move.lossRate}%
                    </div>
                    <div className="text-xs text-white/60">
                      Eval: {move.evaluation.toFixed(2)}
                    </div>
                  </div>
                ))}

                {isStockfishMode && (
                  <div className="mt-4 p-2 bg-blue-500/20 border border-blue-500/50 rounded">
                    <div className="text-sm text-blue-300 font-bold">
                      Stockfish Mode Active
                    </div>
                    <div className="text-xs text-blue-200">
                      Playing best moves...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreationPage;

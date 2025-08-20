"use client";
import type { NextPage } from "next";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import TopBar from "../../components/topbar";
import Buttons from "../../components/buttons";
import type { Square } from "chess.js";
import { API_BASE_URL } from "../../utils/apiConfig";
import AppNumberInput from "../../components/AppNumberInput";
import { getVisionOverlays } from "../../components/VisionMode";
import { getExercises } from "../../utils/exercises";




interface AnalysisMove {
  move: string;
  evaluation: number;
  isCritical: boolean;
}



function ColorDot({ color, selected }: { color: 'white' | 'black', selected?: boolean }) {
  return (
    <span
      className={`inline-block w-4 h-4 rounded-full border transition-all duration-150
        ${color === 'white' ? 'bg-white border-[#7eeeff] shadow-[0_0_6px_rgba(36,245,228,0.13)]' : 'bg-[#111] border-[#7eeeff]'}
        ${selected ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80'}
      `}
      style={{ boxShadow: color === 'white' ? '0 0 0 1.5px rgba(36,245,228,0.13)' : undefined }}
    />
  );
}

const CreationPage: NextPage = () => {
  const [game, setGame] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(700);
  const [analysis, setAnalysis] = useState<AnalysisMove[]>([]);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [boardHighlight, setBoardHighlight] = useState<string>("");
  const [stockfishMoves, setStockfishMoves] = useState<string[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [customPGN, setCustomPGN] = useState("");
  const [customColor, setCustomColor] = useState<'white'|'black'>('white');
  const [customError, setCustomError] = useState<string>("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const boardRef = useRef<any>(null);
  const [visionMode, setVisionMode] = useState(false);



  // Vision overlays
  const visionSquares = useMemo(() => visionMode ? getVisionOverlays(game, 'both') : {}, [visionMode, game]);

  // Apply settings automatically when they change
  useEffect(() => {
    // Only reset if there's no PGN loaded and we're changing from a state with PGN
    if (!customPGN.trim() && moveHistory.length === 0) {
      setGame(new Chess());
      setAnalysis([]);
      setMoveHistory([]);
      setHistoryIndex(null);
    }
  }, [customColor]);

  // Handle arrow keys for move history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys if we have move history
      if (moveHistory.length === 0) return;
      
      if (e.key === "ArrowLeft") {
        if (historyIndex !== null && historyIndex > 0) {
          goToHistoryIndex(historyIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (historyIndex !== null && historyIndex < moveHistory.length) {
          goToHistoryIndex(historyIndex + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, moveHistory]);

  // Function to go to specific history index
  const goToHistoryIndex = (idx: number) => {
    const chess = new Chess();
    for (let i = 0; i < idx; i++) {
      const move = moveHistory[i];
      if (!move) break;
      chess.move(move);
    }
    setGame(chess);
    setHistoryIndex(idx);
  };



  const checkPositionEvaluation = async (fen: string) => {
    try {
      // Deterministic evaluation based on FEN hash
      const hash = fen.split(' ').join('').length;
      const mockEvaluation = ((hash % 200) - 100) / 100; // -1.0 to 1.0
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

    // Sprawdź czy jesteśmy na ostatnim ruchu historii
    const isAtLatestMove = historyIndex === null || historyIndex === moveHistory.length;
    
    if (isAtLatestMove) {
      // Dodaj do historii tylko jeśli jesteśmy na ostatnim ruchu
      setMoveHistory(prev => {
        const newLength = prev.length + 1;
        setHistoryIndex(newLength);
        return [...prev, move];
      });

    const evaluation = await checkPositionEvaluation(newGame.fen());

    setAnalysis((prev) => [
      ...prev,
      {
        move,
        evaluation,
          isCritical: false,
      },
    ]);
    } else {
      // Jeśli nie jesteśmy na ostatnim ruchu, to jest wariant - nie dodawaj do historii
      // Ustaw historyIndex na pozycję po aktualnym ruchu w wariancie
      setHistoryIndex(moveHistory.length + 1);
    }

    setBoardHighlight("");
    
    // Reset selected move after making the move
    setSelectedMove(null);
  };

  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    // Check if move is legal before attempting it
    const legalMoves = game.moves({ verbose: true });
    const isLegal = legalMoves.some(m => m.from === sourceSquare && m.to === targetSquare);
    
    if (!isLegal) {
      return false; // Don't allow illegal moves
    }

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };
    const newGame = new Chess(game.fen());
    const result = newGame.move(move);
    if (!result) return false;

    const algebraicMove = result.san;



    setGame(newGame);
    
    // Sprawdź czy jesteśmy na ostatnim ruchu historii
    const isAtLatestMove = historyIndex === null || historyIndex === moveHistory.length;
    
    if (isAtLatestMove) {
      // Dodaj do historii tylko jeśli jesteśmy na ostatnim ruchu
      setMoveHistory(prev => {
        const newLength = prev.length + 1;
        setHistoryIndex(newLength);
        return [...prev, algebraicMove];
      });
    } else {
      // Jeśli nie jesteśmy na ostatnim ruchu, to jest wariant - nie dodawaj do historii
      // Ustaw historyIndex na pozycję po aktualnym ruchu w wariancie
      setHistoryIndex(moveHistory.length + 1);
    }
    
    // Reset selected move after making the move
    setSelectedMove(null);
    
    return true;
  };

  const handleAddCustomExercise = () => {
    setCustomError("");
    // Walidacja: PGN musi zaczynać się od pozycji startowej
    const pgn = customPGN.trim();
    if (!/^1\./.test(pgn)) {
      setCustomError("");
      return;
    }
    // Spróbuj sparsować PGN
    let chess;
    try {
      chess = new Chess();
      chess.loadPgn(pgn);
    } catch (e) {
      setCustomError("");
      return;
    }
    // Zapisz do localStorage
    const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
    const newExercise = {
      id: 'custom-' + Date.now(),
      name: exerciseName.trim(),
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Proper FEN for starting position
      pgn,
      color: customColor,
      createdAt: new Date().toISOString(),
    };
    customExercises.push(newExercise);
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
    setCustomPGN("");
    setExerciseName("");
    // Refresh the custom exercises list
    setCustomExercises(customExercises);
    
    // Dodaj zieloną obwódkę i odśwież popular moves
    setHighlightButton(true);
    setRefreshTrigger(prev => prev + 1); // Wymuś re-render popular moves
    setTimeout(() => setHighlightButton(false), 2000); // Usuń po 2 sekundach
  };

  // Function to add current board history as exercise
  const handleAddCurrentHistory = () => {
    setCustomError("");
    
    if (moveHistory.length === 0) {
      setCustomError("");
      return;
    }

    // Generuj PGN bez nagłówków - tylko ruchy
    const cleanPgn = moveHistory.join(" ");

    // Zapisz do localStorage
    const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
    const newExercise = {
      id: 'custom-' + Date.now(),
      name: exerciseName.trim(),
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Proper FEN for starting position
      pgn: cleanPgn,
      color: customColor,
      createdAt: new Date().toISOString(),
    };
    customExercises.push(newExercise);
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
    setExerciseName("");
    // Refresh the custom exercises list
    setCustomExercises(customExercises);
    
    // Dodaj zieloną obwódkę i odśwież popular moves
    setHighlightButton(true);
    setRefreshTrigger(prev => prev + 1); // Wymuś re-render popular moves
    setTimeout(() => setHighlightButton(false), 2000); // Usuń po 2 sekundach
  };

  // Function to preview PGN on the board
  const previewPGN = () => {
    const pgn = customPGN.trim();
    if (!pgn || !/^1\./.test(pgn)) return;
    
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      setGame(chess);
      setMoveHistory(chess.history());
      setHistoryIndex(chess.history().length);
      setCustomError("");
      setSelectedMove(null);
    } catch (e) {
      setCustomError("");
    }
  };

  // Function to load exercise back to board
  const loadExerciseToBoard = (exercise: any) => {
    try {
      const chess = new Chess();
      if (exercise.pgn) {
        chess.loadPgn(exercise.pgn);
      }
      setGame(chess);
      setMoveHistory(chess.history());
      setHistoryIndex(chess.history().length);
      setCustomPGN(exercise.pgn || "");
      setCustomColor(exercise.color || 'white');
      
      // Reset selected move when loading new exercise
      setSelectedMove(null);
    } catch (e) {
      setCustomError("");
    }
  };

  // Function to delete custom exercise
  const deleteCustomExercise = (exerciseId: string) => {
    const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
    const filtered = customExercises.filter((ex: any) => ex.id !== exerciseId);
    localStorage.setItem('customExercises', JSON.stringify(filtered));
    setCustomError("");
    // Refresh the custom exercises list
    setCustomExercises(filtered);
  };

  // Load custom exercises for display
  const [customExercises, setCustomExercises] = useState<any[]>([]);
  const [showCustomExercises, setShowCustomExercises] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadCustomExercises = () => {
      try {
        const exercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
        setCustomExercises(exercises);
      } catch (e) {
        setCustomExercises([]);
      }
    };
    loadCustomExercises();
  }, []);

  // Auto-preview PGN when it changes
  useEffect(() => {
    if (customPGN.trim()) {
      previewPGN();
    }
  }, [customPGN]);

  // Render move history
  const renderMoveHistory = () => {
    return (
      <div>
        <div className="flex gap-2 mb-2">
          <Buttons
            bUTTON="Clear history"
            className="!py-1 !px-3 !text-xs !rounded"
            onLogInButtonContainerClick={() => {
              setMoveHistory([]);
              setAnalysis([]);
              setHistoryIndex(null);
              setGame(new Chess());
              setSelectedMove(null);
            }}
          />
          <Buttons
            bUTTON="Remove last move"
            className="!py-1 !px-3 !text-xs !rounded"
            onLogInButtonContainerClick={() => {
              if (moveHistory.length === 0) return;
              const newHistory = moveHistory.slice(0, -1);
              setMoveHistory(newHistory);
              setAnalysis(analysis.slice(0, -1));
              const chess = new Chess();
              for (let i = 0; i < newHistory.length; i++) {
                chess.move(newHistory[i]);
              }
              setGame(chess);
              setHistoryIndex(newHistory.length);
              setSelectedMove(null);
            }}
          />
        </div>
        {/* Historia ruchów z obsługą wariantów */}
        {moveHistory.length === 0 ? (
          <div className="bg-[rgba(36,245,228,0.08)] border border-[rgba(36,245,228,0.18)] rounded p-2 mt-2 text-xs text-white/60">
            No moves played yet
          </div>
        ) : (
          (() => {
            let out: string[] = [];
            for (let i = 0; i < moveHistory.length; i += 2) {
              const num = Math.floor(i / 2) + 1;
              const white = moveHistory[i] || "";
              const black = moveHistory[i + 1] || "";
              out.push(`${num}. ${white} ${black}`.trim());
            }
            
            // Dodaj informację o wariantach jeśli historyIndex > moveHistory.length
            let variantInfo = "";
            if (historyIndex !== null && historyIndex > moveHistory.length) {
              variantInfo = ` (variant)`;
            }
            
            return (
              <div className="bg-[rgba(36,245,228,0.08)] border border-[rgba(36,245,228,0.18)] rounded p-2 mt-2 text-xs text-white/80 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="font-bold mb-1">Move History</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {out.map((line, idx) => (
                    <span key={idx} className={historyIndex !== null && Math.floor(historyIndex/2) === idx ? "text-cyan-400 font-bold" : ""}>{line}</span>
                  ))}
                  {variantInfo && (
                    <span className="text-yellow-400 italic">{variantInfo}</span>
                  )}
                </div>
                <div className="mt-1 text-white/50 text-xs">
                  Use ←/→ arrows to browse history{variantInfo ? " • Current position is a variant" : ""}
                </div>
              </div>
            );
          })()
        )}
      </div>
    );
  };

  useEffect(() => {
    const updateBoardWidth = () => {
      setBoardWidth(Math.min(700, window.innerWidth * 0.65));
    };
    updateBoardWidth();
    window.addEventListener("resize", updateBoardWidth);
    return () => window.removeEventListener("resize", updateBoardWidth);
  }, []);



  return (
    <div className="w-full min-h-screen h-full relative bg-[#010706] overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[20%] w-[40rem] h-[40rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />
        <div className="absolute top-[60%] right-[-15%] w-[30rem] h-[30rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />
        <div className="absolute top-[30%] left-[60%] w-[25rem] h-[25rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>
      <main className="w-full flex flex-col !pt-[0rem] !pb-[6rem] !pl-[0rem] !pr-[0rem] box-border gap-[0.5rem] max-w-full mq1225:!pb-[5rem] mq1225:box-border mq450:gap-[0.3rem] mq450:!pb-[4rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[0.7rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[0.5rem] mq450:gap-[0.2rem]">
          <div className="w-full">
            <TopBar />
          </div>
          <div className="w-full px-1 mt-[-0.5rem]">
            <div className="flex flex-row gap-4 max-w-[1400px] mx-auto items-start">
              {/* Left: Add custom exercise */}
              <div className="w-[300px] bg-white/5 border border-white/30 rounded-lg p-4 mb-6 mt-8">
                <h3 className="text-lg text-cyan-300 mb-3">Add your own exercise</h3>
                {/* Vision Mode Toggle Button */}
                <div className="mb-3">
                  <Buttons
                    bUTTON={visionMode ? "Vision Mode: ON" : "Vision Mode"}
                    className={visionMode ? "bg-[rgba(36,245,228,0.13)] border-cyan-400" : ""}
                    onLogInButtonContainerClick={() => setVisionMode(v => !v)}
                  />
                </div>
                {/* Exercise Name Input */}
                <div className="mb-3">
                  <input
                    value={exerciseName}
                    onChange={e => setExerciseName(e.target.value)}
                    placeholder="Exercise name"
                    className="w-full h-8 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                  />
                </div>

                {/* PGN Input - smaller size */}
                <div className="h-16 mb-3">
                  <textarea
                    value={customPGN}
                    onChange={e => setCustomPGN(e.target.value)}
                    placeholder="Paste your PGN here (optional)"
                    className="w-full h-12 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs mb-2"
                  />
                </div>

                <div className="flex items-center gap-6 mb-5">
                  <label className="text-white/80 text-sm">Training color:</label>
                  <label className="flex items-center gap-4 cursor-pointer select-none">
                    <input type="radio" checked={customColor==='white'} onChange={()=>setCustomColor('white')} className="hidden" />
                    <ColorDot color="white" selected={customColor==='white'} />
                    <span className="text-white/80 text-xs ml-1">White</span>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer select-none">
                    <input type="radio" checked={customColor==='black'} onChange={()=>setCustomColor('black')} className="hidden" />
                    <ColorDot color="black" selected={customColor==='black'} />
                    <span className="text-white/80 text-xs ml-1">Black</span>
                  </label>
                </div>

                {/* Two buttons for adding exercises */}
                <div className="flex flex-col gap-4 mb-5 mt-2">
                  <Buttons
                    bUTTON="Add PGN Exercise"
                    onLogInButtonContainerClick={handleAddCustomExercise}
                    className="w-full !py-2 text-sm"
                  />
                  <Buttons
                    bUTTON="Add Current Position"
                    className="w-full !py-2 text-sm"
                    onLogInButtonContainerClick={handleAddCurrentHistory}
                  />
                </div>

                {customError && <div className="mt-2 text-xs text-red-400">{customError}</div>}
                
                {/* Move History - moved to left panel */}
                {renderMoveHistory()}
              </div>
              {/* Center: Chessboard (identycznie jak w TrainingBoard) */}
              <div className="flex-1 border rounded-lg p-4 flex flex-col items-center justify-center mt-6" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.3)' }}>
                <div
                  className="aspect-square mt-0"
                  style={{ width: 700, height: 700, minWidth: 700, minHeight: 700, maxWidth: 700, maxHeight: 700 }}
                >
                  <div className={`w-full h-full flex items-center justify-center mx-auto${boardHighlight === 'red' ? ' ring-4' : ''}`}
                    style={boardHighlight === 'red' ? { boxShadow: '0 0 0 4px var(--red-55)' } : {}}>
                    <Chessboard
                      position={game.fen()}
                      boardWidth={700}
                      onPieceDrop={handlePieceDrop}
                      boardOrientation={customColor}
                      customSquareStyles={visionSquares}
                      customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                        width: 700,
                        height: 700
                      }}
                      customArrowColor="var(--blue-84)"
                    />
                  </div>
                </div>
              </div>
              {/* Right: Popular Moves with Opening Tree Integration */}
              <div className="w-[370px] bg-white/5 border border-white/30 rounded-lg p-4 mt-8">
                <h3 className="text-lg text-cyan-300 mb-3">Exercise Lines Analyzed</h3>
                
                
                <div className="space-y-2">

                  
                  {/* Popular Moves from Study Database + User Exercises */}
                  {(() => {
                    // Pobierz bazę gier study z exercises.json
                    const studyGames = getExercises();
                    
                    // Dodaj ćwiczenia użytkownika do bazy study tylko po stronie klienta
                    const allGames = [...studyGames, ...(isClient ? customExercises : [])];
                    
                    // refreshTrigger wymusza re-render gdy dodamy nowe ćwiczenie
                    const _ = refreshTrigger;
                    
                    // Pobierz ruchy z bazy study w zależności od pozycji
                    const popularMoves: Array<{
                      move: string;
                      name: string;
                      games?: string[];
                    }> = [];
                    
                    if (moveHistory.length === 0) {
                      // Dla pozycji startowej pokaż pierwsze ruchy z bazy study + ćwiczeń użytkownika
                      const firstMoves = new Map<string, { count: number, games: string[] }>();
                      
                      allGames.forEach(game => {
                        let moves: string[] = [];
                        
                        // Sprawdź czy to ćwiczenie z analysis czy z pgn
                        if (game.analysis && game.analysis.length > 0) {
                          // Ćwiczenie z analysis
                          moves = game.analysis.map((a: any) => a.move);
                        } else if (game.pgn) {
                          // Ćwiczenie z pgn (custom exercises)
                          moves = game.pgn.split(' ').filter((m: string) => m !== '1.' && m !== '2.' && m !== '3.' && m !== '4.' && m !== '5.' && m !== '6.' && m !== '7.' && m !== '8.' && m !== '9.' && m !== '10.' && m !== '');
                        }
                        
                        const firstMove = moves[0];
                        if (firstMove) {
                          if (!firstMoves.has(firstMove)) {
                            firstMoves.set(firstMove, { count: 1, games: [game.name] });
                          } else {
                            const existing = firstMoves.get(firstMove)!;
                            existing.count++;
                            existing.games.push(game.name);
                          }
                        }
                      });
                      
                      // Sortuj według popularności i dodaj do popularMoves
                      Array.from(firstMoves.entries())
                        .sort((a, b) => b[1].count - a[1].count)
                        .forEach(([move, data]) => {
                          popularMoves.push({
                            move,
                            name: `${data.count} games`,
                            games: data.games
                          });
                        });
                    } else {
                      // Dla innych pozycji znajdź gry które mają te same ruchy
                      const matchingGames = allGames.filter(game => {
                        let gameMoves: string[] = [];
                        
                        // Sprawdź czy to ćwiczenie z analysis czy z pgn
                        if (game.analysis && game.analysis.length > 0) {
                          // Ćwiczenie z analysis
                          gameMoves = game.analysis.map((a: any) => a.move);
                        } else if (game.pgn) {
                          // Ćwiczenie z pgn (custom exercises)
                          gameMoves = game.pgn.split(' ').filter((m: string) => m !== '1.' && m !== '2.' && m !== '3.' && m !== '4.' && m !== '5.' && m !== '6.' && m !== '7.' && m !== '8.' && m !== '9.' && m !== '10.' && m !== '');
                        }
                        
                        if (gameMoves.length === 0) return false;
                        
                        const currentMoves = moveHistory;
                        
                        // Sprawdź czy gra zaczyna się od aktualnych ruchów
                        if (gameMoves.length < currentMoves.length) return false;
                        return currentMoves.every((move, index) => gameMoves[index] === move);
                      });
                      
                      // Pobierz następne ruchy z pasujących gier
                      const nextMoves = new Map<string, { count: number, games: string[] }>();
                      matchingGames.forEach(game => {
                        let gameMoves: string[] = [];
                        
                        // Sprawdź czy to ćwiczenie z analysis czy z pgn
                        if (game.analysis && game.analysis.length > 0) {
                          // Ćwiczenie z analysis
                          gameMoves = game.analysis.map((a: any) => a.move);
                        } else if (game.pgn) {
                          // Ćwiczenie z pgn (custom exercises)
                          gameMoves = game.pgn.split(' ').filter((m: string) => m !== '1.' && m !== '2.' && m !== '3.' && m !== '4.' && m !== '5.' && m !== '6.' && m !== '7.' && m !== '8.' && m !== '9.' && m !== '10.' && m !== '');
                        }
                        
                        const nextMove = gameMoves[moveHistory.length];
                        if (nextMove) {
                          if (!nextMoves.has(nextMove)) {
                            nextMoves.set(nextMove, { count: 1, games: [game.name] });
                          } else {
                            const existing = nextMoves.get(nextMove)!;
                            existing.count++;
                            existing.games.push(game.name);
                          }
                        }
                      });
                      
                      // Dodaj następne ruchy
                      Array.from(nextMoves.entries())
                        .sort((a, b) => b[1].count - a[1].count)
                        .forEach(([move, data]) => {
                          popularMoves.push({
                            move,
                            name: `${data.count} games`,
                            games: data.games
                          });
                        });
                    }
                    
                    return popularMoves.map((move, index) => (
                    <div
                      key={index}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedMove === move.move
                          ? "bg-cyan-400/30 border border-cyan-400/50"
                          : "bg-white/10 hover:bg-white/15"
                      }`}
                      onClick={() => handleMoveSelect(move.move)}
                    >
                      <div className="text-sm font-bold">{move.move}</div>
                      <div className="text-xs text-white/70">
                          {move.name}
                      </div>
                      <div className="text-xs text-white/60">
                          {move.games && move.games.length > 0 && (
                            <div className="text-cyan-300">
                              {move.games.slice(0, 2).join(', ')}
                              {move.games.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                  
                  {/* Custom Exercises Section */}
                  {isClient && customExercises.length > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCustomExercises(!showCustomExercises)}
                        className={`w-full p-3 bg-white/10 border rounded-lg hover:bg-white/15 transition-all duration-200 flex items-center justify-between ${
                          highlightButton 
                            ? 'border-green-400 shadow-lg shadow-green-400/20' 
                            : 'border-white/20'
                        }`}
                      >
                        <span className="text-sm font-bold text-white">
                          Your Custom Exercises ({customExercises.length})
                        </span>
                        <span className="text-white">
                          {showCustomExercises ? '▼' : '▶'}
                        </span>
                      </button>
                      
                      {showCustomExercises && (
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                          {customExercises.map((exercise) => (
                            <div key={exercise.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                              <div 
                                className="flex-1 cursor-pointer hover:bg-white/10 transition-colors p-1 rounded"
                                onClick={() => loadExerciseToBoard(exercise)}
                              >
                                <div className="text-sm font-bold text-white">{exercise.name}</div>
                                <div className="text-xs text-white/60">{exercise.color} to play</div>
                              </div>
                              <button
                                onClick={() => deleteCustomExercise(exercise.id)}
                                className="ml-2 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-xs hover:bg-red-500/30 transition-colors"
                              >
                                Delete
                              </button>
                    </div>
                  ))}
                      </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default CreationPage;

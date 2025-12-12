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
import { getExercises, getCustomExercises, type Exercise } from "../../utils/exercises";
import { exercisesApi, authApi } from "../../utils/api";
import MoveInput from "../../components/MoveInput";




interface AnalysisMove {
  move: string;
  evaluation: number;
  isCritical: boolean;
}



function ColorDot({ color, selected }: { color: 'white' | 'black', selected?: boolean }) {
  return (
    <span
      className={`inline-block w-5 h-5 rounded-full border-2 transition-all duration-150
        ${color === 'white' ? 'bg-white border-[#7eeeff] shadow-[0_0_6px_rgba(36,245,228,0.13)]' : 'bg-[#111] border-[#7eeeff]'}
        ${selected ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80'}
      `}
      style={{ 
        boxShadow: color === 'white' ? '0 0 0 1.5px rgba(36,245,228,0.13)' : undefined,
        minWidth: '20px',
        minHeight: '20px',
        width: '20px',
        height: '20px'
      }}
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
  const [isPublic, setIsPublic] = useState(false);
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

  const handleAddCustomExercise = async () => {
    setCustomError("");
    
    // Walidacja: PGN musi zaczynać się od pozycji startowej
    const pgn = customPGN.trim();
    if (!/^1\./.test(pgn)) {
      setCustomError("Invalid PGN format");
      return;
    }
    // Spróbuj sparsować PGN
    let chess;
    try {
      chess = new Chess();
      chess.loadPgn(pgn);
    } catch (e) {
      setCustomError("Invalid PGN");
      return;
    }
    
    // Zawsze zapisz lokalnie
    const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
    const newExercise = {
      id: 'custom-' + Date.now(),
      name: exerciseName.trim() || "Exercise " + Date.now(),
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn,
      color: customColor,
      createdAt: new Date().toISOString(),
      isPublic: false, // localStorage nie obsługuje publicznych
    };
    customExercises.push(newExercise);
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
    
    // Jeśli użytkownik jest zalogowany, zapisz również do backendu (cicho, bez błędów)
    if (authApi.isAuthenticated()) {
      await exercisesApi.create({
        name: exerciseName.trim() || "Exercise " + Date.now(),
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        pgn,
        color: customColor,
        isPublic: isPublic,
      });
      // Nie pokazujemy błędu jeśli się nie uda - lokalne zapisanie się udało
    }
    
    setCustomPGN("");
    setExerciseName("");
    setIsPublic(false);
    
    // Refresh the custom exercises list
    await loadCustomExercises();
    
    // Dodaj zieloną obwódkę i odśwież popular moves
    setHighlightButton(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setHighlightButton(false), 2000);
  };

  // Function to add current board history as exercise
  const handleAddCurrentHistory = async () => {
    setCustomError("");
    
    if (moveHistory.length === 0) {
      setCustomError("No moves to save");
      return;
    }

    // Generuj PGN bez nagłówków - tylko ruchy
    const cleanPgn = moveHistory.join(" ");

    // Zawsze zapisz lokalnie
    const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
    const newExercise = {
      id: 'custom-' + Date.now(),
      name: exerciseName.trim() || "Exercise " + Date.now(),
      initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: cleanPgn,
      color: customColor,
      createdAt: new Date().toISOString(),
      isPublic: false, // localStorage nie obsługuje publicznych
    };
    customExercises.push(newExercise);
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
    
    // Jeśli użytkownik jest zalogowany, zapisz również do backendu (cicho, bez błędów)
    if (authApi.isAuthenticated()) {
      await exercisesApi.create({
        name: exerciseName.trim() || "Exercise " + Date.now(),
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        pgn: cleanPgn,
        color: customColor,
        isPublic: isPublic,
      });
      // Nie pokazujemy błędu jeśli się nie uda - lokalne zapisanie się udało
    }
    
    setExerciseName("");
    setIsPublic(false);
    
    // Refresh the custom exercises list
    await loadCustomExercises();
    
    // Dodaj zieloną obwódkę i odśwież popular moves
    setHighlightButton(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setHighlightButton(false), 2000);
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
        // If PGN doesn't start with "1.", add it for proper parsing
        let pgnToLoad = exercise.pgn;
        if (!pgnToLoad.startsWith('1.')) {
          // Try to format as proper PGN
          const moves = pgnToLoad.split(' ').filter((m: string) => m);
          let formattedPgn = '';
          for (let i = 0; i < moves.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const white = moves[i] || '';
            const black = moves[i + 1] || '';
            formattedPgn += `${moveNum}. ${white} ${black} `.trim() + ' ';
          }
          pgnToLoad = formattedPgn.trim();
        }
        chess.loadPgn(pgnToLoad);
      }
      setGame(chess);
      setMoveHistory(chess.history());
      setHistoryIndex(chess.history().length);
      setCustomPGN(exercise.pgn || "");
      setCustomColor(exercise.color || 'white');
      setIsPublic(exercise.isPublic || false);
      
      // Reset selected move when loading new exercise
      setSelectedMove(null);
    } catch (e) {
      setCustomError("Failed to load exercise");
    }
  };

  // Function to delete custom exercise
  const deleteCustomExercise = async (exerciseId: string | number) => {
    // Jeśli to lokalne ćwiczenie (string ID)
    if (typeof exerciseId === 'string' && exerciseId.startsWith('custom-')) {
      const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
      const filtered = customExercises.filter((ex: any) => ex.id !== exerciseId);
      localStorage.setItem('customExercises', JSON.stringify(filtered));
      setCustomExercises(filtered);
    } else if (typeof exerciseId === 'number') {
      // Jeśli to ćwiczenie z backendu - usuń lokalnie i spróbuj z backendu (cicho)
      const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
      const filtered = customExercises.filter((ex: any) => ex.id !== exerciseId);
      localStorage.setItem('customExercises', JSON.stringify(filtered));
      setCustomExercises(filtered);
      
      // Spróbuj usunąć z backendu (cicho, bez błędów)
      if (authApi.isAuthenticated()) {
        await exercisesApi.delete(exerciseId);
      }
      await loadCustomExercises();
    }
  };
  
  // Function to load custom exercises from both localStorage and backend
  const loadCustomExercises = async () => {
    const allExercises: any[] = [];
    
    // Załaduj WSZYSTKIE ćwiczenia z localStorage (wspólne dla urządzenia, niezależnie od użytkownika)
    try {
      const localExercisesRaw = JSON.parse(localStorage.getItem('customExercises') || '[]');
      // Upewnij się, że wszystkie ćwiczenia są załadowane - każda gra to oddzielne ćwiczenie
      if (Array.isArray(localExercisesRaw) && localExercisesRaw.length > 0) {
        // Dodaj wszystkie ćwiczenia z localStorage
        allExercises.push(...localExercisesRaw);
      }
    } catch (e) {
      // Cicho obsłuż błąd
      console.warn('Error loading local exercises:', e);
    }
    
    // Załaduj WSZYSTKIE ćwiczenia z backendu dla zalogowanego użytkownika
    if (authApi.isAuthenticated()) {
      try {
        const backendExercises = await exercisesApi.getMyExercises();
        if (backendExercises && Array.isArray(backendExercises) && backendExercises.length > 0) {
          // Dodaj wszystkie ćwiczenia z backendu (każda gra to oddzielne ćwiczenie)
          // Nie sprawdzamy duplikatów - pokazujemy wszystkie
          allExercises.push(...backendExercises);
        }
      } catch (e) {
        // Cicho obsłuż błąd backendu
      }
    }
    
    // Ustaw wszystkie ćwiczenia (lokalne + z serwera)
    setCustomExercises(allExercises);
  };

  // Load custom exercises for display
  const [customExercises, setCustomExercises] = useState<any[]>([]);
  const [publicExercises, setPublicExercises] = useState<any[]>([]);
  const [studyGames, setStudyGames] = useState<Exercise[]>([]);
  const [showCustomExercises, setShowCustomExercises] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Załaduj study games tylko po stronie klienta (unika problemu hydratacji)
    const loadedStudyGames = getExercises();
    setStudyGames(loadedStudyGames);
    
    loadCustomExercises();
    
    // Load public exercises from backend (cicho, bez błędów)
    const loadPublicExercises = async () => {
      const publicExercises = await exercisesApi.getPublicExercises();
      if (publicExercises && publicExercises.length > 0) {
        setPublicExercises(publicExercises);
      }
    };
    loadPublicExercises();
  }, []);

  // Odśwież ćwiczenia gdy strona jest widoczna
  useEffect(() => {
    if (!isClient) return;
    
    // Odśwież ćwiczenia natychmiast
    loadCustomExercises();
    
    // Odśwież co 3 sekundy (aby złapać zmiany w localStorage i autentykacji)
    const interval = setInterval(() => {
      loadCustomExercises();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isClient]);

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
              <div 
                className="bg-[rgba(36,245,228,0.08)] border border-[rgba(36,245,228,0.18)] rounded p-2 mt-2 text-xs text-white/80 max-h-64 overflow-y-scroll move-history-scroll"
                onWheel={(e) => {
                  e.currentTarget.scrollTop += e.deltaY;
                }}
              >
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
    <div className="page-container w-full relative overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal] min-h-screen">
      <main className="content-layer w-full flex flex-col !pt-[0rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border gap-[0.5rem] max-w-full">
        <main className="w-full flex flex-col gap-[0.7rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[0.5rem] mq450:gap-[0.2rem]">
          <div className="w-full">
            <TopBar />
          </div>
          <div className="w-full px-1" style={{ marginTop: '0.5rem' }}>
            <div className="flex flex-row items-center gap-4 max-w-[1400px] mx-auto">
              {/* Left: Add custom exercise */}
              <div className="w-[300px] glass-panel rounded-lg p-4" style={{ marginTop: '0', minHeight: 705, alignSelf: 'flex-start' }}>
                <h3 className="text-lg text-cyan-300 mb-3 text-center">Add your own exercise</h3>
                {/* Vision Mode Toggle Button */}
                <div className="mb-3">
                  <Buttons
                    bUTTON={visionMode ? "Vision Mode: ON" : "Vision Mode"}
                    className={visionMode ? "bg-[rgba(36,245,228,0.13)] border-cyan-400" : ""}
                    onLogInButtonContainerClick={() => setVisionMode(v => !v)}
                  />
                </div>
                {/* Exercise Name Input */}
                <div className="mb-4">
                  <label htmlFor="exerciseName" className="block text-white/80 text-sm mb-2">
                    Exercise Name
                  </label>
                  <input
                    id="exerciseName"
                    value={exerciseName}
                    onChange={e => setExerciseName(e.target.value)}
                    placeholder="Enter exercise name"
                    className="h-[2.125rem] rounded-lg bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full pr-4 pl-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.4)', 
                      outline: 'none',
                      outlineOffset: 0, 
                      background: '#181c1f', 
                      color: '#fff' 
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = '2px solid rgba(36,245,228,0.84)';
                      e.target.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.outlineOffset = '0';
                    }}
                    tabIndex={0}
                  />
                </div>

                {/* PGN Input */}
                <div className="mb-4">
                  <label htmlFor="customPGN" className="block text-white/80 text-sm mb-2">
                    PGN (optional)
                  </label>
                  <textarea
                    id="customPGN"
                    value={customPGN}
                    onChange={e => setCustomPGN(e.target.value)}
                    placeholder="Paste your PGN here"
                    rows={3}
                    className="rounded-lg bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full pr-4 pl-4 pt-2 pb-2 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none resize-none"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.4)', 
                      outline: 'none',
                      outlineOffset: 0, 
                      background: '#181c1f', 
                      color: '#fff' 
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = '2px solid rgba(36,245,228,0.84)';
                      e.target.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.outlineOffset = '0';
                    }}
                    tabIndex={0}
                  />
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <label className="text-white/80 text-sm">Color:</label>
                  <label 
                    className="flex items-center gap-2 cursor-pointer select-none p-2 rounded transition-all duration-150" 
                    tabIndex={0} 
                    role="button" 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCustomColor('white'); } }}
                    style={{ 
                      minWidth: '100px',
                      maxWidth: '120px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '2px solid rgba(36,245,228,0.84)';
                      e.currentTarget.style.outlineOffset = '-2px';
                      e.currentTarget.style.borderRadius = '4px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    <input type="radio" checked={customColor==='white'} onChange={()=>setCustomColor('white')} className="hidden" />
                    <ColorDot color="white" selected={customColor==='white'} />
                    <span className="text-white/80 text-xs">White</span>
                  </label>
                  <label 
                    className="flex items-center gap-2 cursor-pointer select-none p-2 rounded transition-all duration-150" 
                    tabIndex={0} 
                    role="button" 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCustomColor('black'); } }}
                    style={{ 
                      minWidth: '100px',
                      maxWidth: '120px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '2px solid rgba(36,245,228,0.84)';
                      e.currentTarget.style.outlineOffset = '-2px';
                      e.currentTarget.style.borderRadius = '4px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    <input type="radio" checked={customColor==='black'} onChange={()=>setCustomColor('black')} className="hidden" />
                    <ColorDot color="black" selected={customColor==='black'} />
                    <span className="text-white/80 text-xs">Black</span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label 
                    htmlFor="isPublic" 
                    className="flex items-center gap-3 cursor-pointer select-none p-2 rounded-lg transition-all duration-150 hover:bg-[rgba(36,245,228,0.1)]"
                    style={{ 
                      background: isPublic ? 'rgba(36,245,228,0.15)' : 'transparent',
                      border: isPublic ? '1px solid rgba(36,245,228,0.3)' : '1px solid transparent'
                    }}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsPublic(!isPublic);
                      }
                    }}
                  >
                    <div 
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150"
                      style={{
                        borderColor: isPublic ? 'var(--blue-84)' : 'rgba(255,255,255,0.4)',
                        background: isPublic ? 'var(--blue-84)' : 'transparent'
                      }}
                    >
                      {isPublic && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-white/80 text-sm font-['Russo_One']">Make this exercise public</span>
                  </label>
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="hidden"
                  />
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
              {/* Center: Chessboard */}
              <div className="glass-panel-no-filter rounded-lg p-4" style={{ width: 716, minHeight: 705, marginTop: '0', alignSelf: 'flex-start' }}>
                <div style={{ width: 700, height: 700, position: 'relative' }}>
                  <Chessboard
                    position={game.fen()}
                    boardWidth={700}
                    onPieceDrop={handlePieceDrop}
                    boardOrientation={customColor}
                    customSquareStyles={visionSquares}
                    arePiecesDraggable={true}
                    areArrowsAllowed={false}
                    arePremovesAllowed={false}
                    customBoardStyle={{
                      borderRadius: "4px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                    }}
                    customArrowColor="var(--blue-84)"
                    customDropSquareStyle={{
                      boxShadow: "inset 0 0 1px 4px rgba(36,245,228,0.5)"
                    }}
                  />
                </div>
              </div>
              {/* Right: Popular Moves with Opening Tree Integration */}
              <div className="w-[300px] glass-panel rounded-lg p-4" style={{ marginTop: '0', minHeight: 705, alignSelf: 'flex-start' }}>
                <div className="mb-3">
                  <div className="flex justify-center mb-2">
                    <Buttons
                      bUTTON={showCustomExercises ? "Show Moves" : `Custom Exercises (${customExercises.length})`}
                      onLogInButtonContainerClick={() => setShowCustomExercises(!showCustomExercises)}
                      className="!py-1 !px-3 !text-xs !rounded"
                    />
                  </div>
                  <h3 className="text-lg text-cyan-300 text-center">
                    {showCustomExercises ? "Your Custom Exercises" : "Lines Analyzed"}
                  </h3>
                </div>
                
                {!showCustomExercises && (
                  <MoveInput 
                    fen={game.fen()} 
                    onMove={(moveText) => {
                      try {
                        const newGame = new Chess(game.fen());
                        const move = newGame.move(moveText);
                        if (move) {
                          const algebraicMove = move.san;
                          
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
                            // Jeśli nie jesteśmy na końcu, zaktualizuj historyIndex
                            setHistoryIndex(prev => prev !== null ? prev + 1 : 1);
                          }
                          
                          setGame(newGame);
                          return true;
                        }
                        return false;
                      } catch {
                        return false;
                      }
                    }}
                  />
                )}
                
                {showCustomExercises ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => loadCustomExercises()}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-200 text-white text-sm"
                        title="Refresh exercises"
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            loadCustomExercises();
                          }
                        }}
                      >
                        ↻
                      </button>
                    </div>
                    <div 
                      className="space-y-2 overflow-y-scroll exercise-list-scroll"
                      style={{ maxHeight: '792px' }}
                    >
                      {customExercises.length === 0 ? (
                        <div className="text-xs text-white/60 p-2">No exercises yet. Create one above!</div>
                      ) : (
                        customExercises.map((exercise) => {
                          const isBlack = exercise.color === 'black';
                          return (
                            <div
                              key={exercise.id}
                              className="p-2 pr-6 rounded cursor-pointer transition-colors flex items-center justify-between font-['Russo_One']"
                              style={{ background: 'rgba(255,255,255,0.1)' }}
                              onClick={() => loadExerciseToBoard(exercise)}
                              onWheel={(e) => {
                                const scrollContainer = e.currentTarget.closest('.exercise-list-scroll') as HTMLElement;
                                if (scrollContainer) {
                                  scrollContainer.scrollTop += e.deltaY;
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  loadExerciseToBoard(exercise);
                                }
                              }}
                            >
                              <div className="flex-1">
                                <div className="text-white/90 text-sm font-bold mb-1">{exercise.name}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  {isBlack ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 border border-gray-400 flex items-center gap-1">
                                      <span className="w-2 h-2 bg-white rounded-sm"></span>
                                      BLACK
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 border border-gray-400 flex items-center gap-1">
                                      <span className="w-2 h-2 bg-black rounded-sm"></span>
                                      WHITE
                                    </span>
                                  )}
                                  <span className="text-white/60">
                                    {new Date(exercise.createdAt || Date.now()).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCustomExercise(exercise.id);
                                }}
                                className="ml-2 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-xs hover:bg-red-500/30 transition-colors"
                                tabIndex={0}
                                role="button"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteCustomExercise(exercise.id);
                                  }
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="space-y-2 overflow-y-scroll exercise-list-scroll"
                    style={{ maxHeight: '792px' }}
                  >
                    {/* Popular Moves from Study Database + User Exercises */}
                    {isClient ? (() => {
                    // Użyj studyGames z state (załadowane po hydratacji)
                    // Dodaj ćwiczenia użytkownika i publiczne ćwiczenia z backendu
                    const allGames = [
                      ...studyGames, 
                      ...customExercises,
                      ...publicExercises
                    ];
                    
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
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMoveSelect(move.move);
                          }
                        }}
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
                  })() : <div className="text-xs text-white/60">Loading exercises...</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default CreationPage;

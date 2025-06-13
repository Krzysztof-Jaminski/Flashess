"use client";
import type { NextPage } from "next";
import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import TopBar from "../../components/topbar";
import Buttons from "../../components/buttons";

const CreationPage: NextPage = () => {
  const [game, setGame] = useState(new Chess());
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [opponentName, setOpponentName] = useState("");
  const [preferredOpening, setPreferredOpening] = useState("");
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [lichessStudyUrl, setLichessStudyUrl] = useState("");

  const handlePreviousMove = useCallback(() => {
    if (currentMoveIndex > 0) {
      const newIndex = currentMoveIndex - 1;
      setCurrentMoveIndex(newIndex);
      const newGame = new Chess();
      const moves = game.history().slice(0, newIndex + 1);
      moves.forEach(move => newGame.move(move));
      setGame(newGame);
    }
  }, [currentMoveIndex, game]);

  const handleNextMove = useCallback(() => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const newIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newIndex);
      const newGame = new Chess();
      const moves = game.history().slice(0, newIndex + 1);
      moves.forEach(move => newGame.move(move));
      setGame(newGame);
    }
  }, [currentMoveIndex, moveHistory.length, game]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousMove();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePreviousMove, handleNextMove]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false;
      
      // Calculate move number and notation
      const moveNumber = Math.floor(game.history().length / 2) + 1;
      const isWhiteMove = game.history().length % 2 === 0;
      let moveNotation = '';
      
      if (isWhiteMove) {
        moveNotation = `${moveNumber}. ${move.san}`;
      } else {
        // For black moves, check if we need to add the move number
        const lastMove = moveHistory[moveHistory.length - 1];
        if (lastMove && lastMove.startsWith(`${moveNumber}.`)) {
          // If the last move was white's move in this number, append to it
          moveNotation = `${moveNumber}... ${move.san}`;
        } else {
          // If it's a new move number, start fresh
          moveNotation = `${moveNumber}... ${move.san}`;
        }
      }
      
      setMoveHistory(prev => [...prev, moveNotation]);
      setCurrentMoveIndex(moveHistory.length);
      setGame(new Chess(game.fen()));
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleImportPosition = () => {
    try {
      const newGame = new Chess();
      newGame.load(importCode);
      setGame(newGame);
      setImportCode("");
      setMoveHistory([]);
      setCurrentMoveIndex(-1);
    } catch (e) {
      alert("Invalid position code");
    }
  };

  const handleImportLichessStudy = () => {
    // TODO: Implement Lichess study import
    alert("Lichess study import will be implemented soon");
  };

  const handleClearBoard = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
  };

  useEffect(() => {
    if (moveHistory.length > 0) {
      setAnalysis(prev => [...prev, moveHistory[moveHistory.length - 1]]);
    }
  }, [moveHistory]);

  return (
    <div className="w-full relative bg-[#010706] overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal]">
      {/* Background Eclipse Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] -left-[30%] w-[50rem] h-[45rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />
        <div className="absolute top-[-5%] right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />
        <div className="absolute top-[22%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>

      <main className="w-full flex flex-col !pt-[0rem] !pb-[26.625rem] !pl-[0rem] !pr-[0rem] box-border gap-[2.625rem] max-w-full mq1225:!pb-[7.313rem] mq1225:box-border mq450:gap-[1.313rem] mq450:!pb-[4.75rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[5.062rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[2.5rem] mq450:gap-[1.25rem]">
          <div className="w-full">
            <TopBar />
          </div>
          
          <div className="w-full px-1">
            <div className="mb-8 text-center">
              <h2 className="text-2xl text-[rgba(36,245,228,0.84)] mb-4">How to use <span className="text-[rgba(36,245,228,0.84)]">Creation</span> Mode</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Prepare for your next game by analyzing your opponent's style and creating custom training positions.
                Enter your opponent's username and preferred opening to get started.
              </p>
            </div>

            <div className="flex flex-row gap-1 max-w-[1400px] mx-auto">
              {/* Move History - Left Side */}
              <div className="w-[150px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm text-[rgba(36,245,228,0.84)]">Moves</h3>
                  <div className="flex gap-1">
                    <Buttons
                      bUTTON="←"
                      onLogInButtonContainerClick={handlePreviousMove}
                      className="!py-0.5 !px-1.5 text-xs"
                    />
                    <Buttons
                      bUTTON="→"
                      onLogInButtonContainerClick={handleNextMove}
                      className="!py-0.5 !px-1.5 text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {moveHistory.map((move, index) => (
                    <div 
                      key={index} 
                      className={`px-1.5 py-0.5 rounded cursor-pointer text-[11px] ${
                        index === currentMoveIndex 
                          ? 'bg-[rgba(36,245,228,0.84)] text-black' 
                          : 'bg-[rgba(255,255,255,0.1)] text-white'
                      }`}
                      onClick={() => {
                        setCurrentMoveIndex(index);
                        const newGame = new Chess();
                        const moves = game.history().slice(0, index + 1);
                        moves.forEach(move => newGame.move(move));
                        setGame(newGame);
                      }}
                    >
                      {move}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chess Board */}
              <div className="flex-[0.65] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4 lg:p-6">
                <div className="w-full aspect-square max-w-[min(700px,65vw)] mx-auto">
                  <div className="w-full h-full flex items-center justify-center">
                    <Chessboard 
                      position={game.fen()}
                      onPieceDrop={onDrop}
                      boardWidth={Math.min(700, window.innerWidth * 0.65)}
                      customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                        width: "100%",
                        height: "100%"
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <Buttons
                    bUTTON={isSetupMode ? "Exit Setup" : "Setup Position"}
                    onLogInButtonContainerClick={() => setIsSetupMode(!isSetupMode)}
                    className="!py-1 !px-3 text-sm"
                  />
                  <Buttons
                    bUTTON="Clear Board"
                    onLogInButtonContainerClick={handleClearBoard}
                    className="!py-1 !px-3 text-sm"
                  />
                </div>
              </div>

              {/* Right Side - Analysis Panel */}
              <div className="flex-[0.35] space-y-4 min-w-[280px] max-w-[400px]">
                {/* Position Import */}
                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                  <h3 className="text-lg text-[rgba(36,245,228,0.84)] mb-3">Import Position</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/80 mb-1 text-xs">FEN or PGN Code</label>
                      <input
                        type="text"
                        value={importCode}
                        onChange={(e) => setImportCode(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded px-2 py-1 text-white text-xs"
                        placeholder="Paste FEN or PGN code"
                      />
                    </div>
                    <Buttons
                      bUTTON="Import"
                      onLogInButtonContainerClick={handleImportPosition}
                      className="w-full !py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Lichess Study Import */}
                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                  <h3 className="text-lg text-[rgba(36,245,228,0.84)] mb-3">Import from Lichess</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/80 mb-1 text-xs">Study URL</label>
                      <input
                        type="text"
                        value={lichessStudyUrl}
                        onChange={(e) => setLichessStudyUrl(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded px-2 py-1 text-white text-xs"
                        placeholder="Paste Lichess study URL"
                      />
                    </div>
                    <Buttons
                      bUTTON="Import Study"
                      onLogInButtonContainerClick={handleImportLichessStudy}
                      className="w-full !py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Opponent Analysis */}
                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                  <h3 className="text-lg text-[rgba(36,245,228,0.84)] mb-3">Opponent Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/80 mb-1 text-xs">Opponent's Username</label>
                      <input
                        type="text"
                        value={opponentName}
                        onChange={(e) => setOpponentName(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded px-2 py-1 text-white text-xs"
                        placeholder="Enter username (Chess.com/Lichess)"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-1 text-xs">Preferred Opening</label>
                      <input
                        type="text"
                        value={preferredOpening}
                        onChange={(e) => setPreferredOpening(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded px-2 py-1 text-white text-xs"
                        placeholder="e.g., Sicilian Defense"
                      />
                    </div>
                    <Buttons
                      bUTTON="Analyze Opponent"
                      onLogInButtonContainerClick={() => {}}
                      className="w-full !py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Save to Training List */}
                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                  <h3 className="text-lg text-[rgba(36,245,228,0.84)] mb-3">Save to Training List</h3>
                  <Buttons
                    bUTTON="Save Current Position"
                    onLogInButtonContainerClick={() => {}}
                    className="w-full !py-1 text-sm"
                  />
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

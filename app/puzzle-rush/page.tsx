"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Buttons from '../../components/buttons';
import TopBar from '../../components/topbar';

interface Position {
  id: string;
  fen: string;
  solution: string;
}

const PuzzleRushPage = () => {
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [correctMove, setCorrectMove] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedPositionSet, setSelectedPositionSet] = useState('beginner');
  const [boardWidth, setBoardWidth] = useState(700);

  const positionSets = [
    {
      id: 'sicilian',
      name: 'Sicilian Defense',
      positions: [
        { id: 1, fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: 'e4c5' },
        { id: 2, fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: 'e4c5' },
        { id: 3, fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: 'e4c5' },
      ]
    },
    {
      id: 'kings-gambit',
      name: "King's Gambit",
      positions: [
        { id: 1, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', solution: 'e4e5' },
        { id: 2, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: 'f2f4' },
        { id: 3, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 1', solution: 'e5f4' },
      ]
    },
    {
      id: 'queens-gambit',
      name: "Queen's Gambit",
      positions: [
        { id: 1, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', solution: 'd7d5' },
        { id: 2, fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: 'e4d5' },
        { id: 3, fen: 'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1', solution: 'e7e6' },
      ]
    },
    {
      id: 'ruy-lopez',
      name: 'Ruy Lopez',
      positions: [
        { id: 1, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', solution: 'e7e5' },
        { id: 2, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: 'g1f3' },
        { id: 3, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 1', solution: 'b8c6' },
      ]
    }
  ];

  useEffect(() => {
    const updateBoardWidth = () => {
      setBoardWidth(Math.min(700, window.innerWidth * 0.65));
    };

    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);

    return () => {
      window.removeEventListener('resize', updateBoardWidth);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      // Handle end of game
    }
  }, [isPlaying, timeLeft]);

  const loadNewPosition = () => {
    // TODO: Load position from backend
    const newGame = new Chess();
    setGame(newGame);
    setShowSolution(false);
    setIsCorrect(null);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      setGame(new Chess(game.fen()));
      
      // TODO: Check if move is correct
      const isCorrectMove = true; // Replace with actual check
      setIsCorrect(isCorrectMove);
      
      if (isCorrectMove) {
        setScore(prev => prev + 1);
        setTimeout(loadNewPosition, 1000);
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  const startGame = () => {
    setTimeLeft(300);
    setScore(0);
    setIsPlaying(true);
    loadNewPosition();
  };

  return (
    <div className="w-full relative bg-[#010706] overflow-hidden flex flex-col min-h-screen">
      {/* Background Eclipse Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] -left-[30%] w-[50rem] h-[45rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />
        <div className="absolute top-[-5%] right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />
        <div className="absolute top-[22%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>

      <main className="w-full flex flex-col gap-[5.062rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[2.5rem] mq450:gap-[1.25rem]">
        <div className="w-full">
          <TopBar />
        </div>

        <div className="w-full px-4 md:px-8">
          <div className="flex flex-row gap-4 max-w-[1200px] mx-auto">
            {/* Position Set Selection */}
            <div className="w-[200px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
              <h3 className="text-[rgba(36,245,228,0.84)] font-['Russo_One'] mb-4">Position Sets</h3>
              <div className="flex flex-col gap-2">
                {positionSets.map(set => (
                  <button
                    key={set.id}
                    className={`px-3 py-2 rounded text-left font-['Russo_One'] ${
                      selectedPositionSet === set.id
                        ? 'bg-[rgba(36,245,228,0.84)] text-black'
                        : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]'
                    }`}
                    onClick={() => setSelectedPositionSet(set.id)}
                  >
                    {set.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chess Board */}
            <div className="flex-[0.65] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
              <div className="w-full aspect-square max-w-[min(700px,65vw)] mx-auto">
                <div className="w-full h-full flex items-center justify-center">
                  <Chessboard 
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardWidth={boardWidth}
                    customBoardStyle={{
                      borderRadius: "4px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                      width: "100%",
                      height: "100%"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Training Info */}
            <div className="flex-[0.35] space-y-4 min-w-[250px] max-w-[350px]">
              {/* How to use */}
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                <h3 className="text-lg text-[rgba(36,245,228,0.84)] font-['Russo_One'] mb-3">How to use</h3>
                <div className="space-y-2">
                  <p className="text-white/80 text-sm font-['Russo_One']">1. Select a position set from the left</p>
                  <p className="text-white/80 text-sm font-['Russo_One']">2. Find the best move in the position</p>
                  <p className="text-white/80 text-sm font-['Russo_One']">3. Click "Next Position" to continue</p>
                  <p className="text-white/80 text-sm font-['Russo_One']">4. Use "Show Solution" if you're stuck</p>
                </div>
              </div>

              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                <h3 className="text-lg text-[rgba(36,245,228,0.84)] font-['Russo_One'] mb-3">Puzzle Rush</h3>
                <div className="space-y-3">
                  <p className="text-white/80 text-sm font-['Russo_One']">Solve positions against the clock</p>
                  <p className="text-white/80 text-sm font-['Russo_One']">5 minutes to solve as many as possible</p>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-4">
                <h3 className="text-lg text-[rgba(36,245,228,0.84)] font-['Russo_One'] mb-3">Controls</h3>
                <div className="space-y-2">
                  {!isPlaying ? (
                    <Buttons
                      bUTTON="Start Game"
                      onLogInButtonContainerClick={startGame}
                      className="w-full !py-1 text-sm"
                    />
                  ) : (
                    <>
                      <Buttons
                        bUTTON="Next Position"
                        onLogInButtonContainerClick={loadNewPosition}
                        className="w-full !py-1 text-sm"
                      />
                      <Buttons
                        bUTTON="Show Solution"
                        onLogInButtonContainerClick={() => setShowSolution(true)}
                        className="w-full !py-1 text-sm"
                      />
                    </>
                  )}
                </div>

                {/* Timer and Score */}
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.3)]">
                  <div className="flex justify-between items-center">
                    <div className="text-[rgba(36,245,228,0.84)] font-['Russo_One']">Time</div>
                    <div className="text-white font-['Russo_One']">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[rgba(36,245,228,0.84)] font-['Russo_One']">Score</div>
                    <div className="text-white font-['Russo_One']">{score}</div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {isCorrect !== null && (
                <div className={`bg-[rgba(255,255,255,0.05)] border ${
                  isCorrect ? 'border-green-500' : 'border-red-500'
                } rounded-lg p-4`}>
                  <p className={`text-center font-['Russo_One'] ${
                    isCorrect ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Try again'}
                  </p>
                </div>
              )}

              {/* Solution */}
              {showSolution && (
                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(36,245,228,0.84)] rounded-lg p-4">
                  <h3 className="text-lg text-[rgba(36,245,228,0.84)] font-['Russo_One'] mb-2">Solution</h3>
                  <p className="text-white/80 text-sm font-['Russo_One']">
                    {correctMove}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PuzzleRushPage; 
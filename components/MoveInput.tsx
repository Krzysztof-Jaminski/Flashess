import React, { useState, useCallback } from "react";
import { Chess } from "chess.js";

interface MoveInputProps {
  fen: string;
  onMove: (move: string) => boolean;
  disabled?: boolean;
}

const MoveInput: React.FC<MoveInputProps> = ({ fen, onMove, disabled = false }) => {
  const [moveText, setMoveText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(() => {
    if (!moveText.trim()) return;
    
    setError("");
    const chess = new Chess(fen);
    
    try {
      // Spróbuj wykonać ruch w notacji SAN
      const move = chess.move(moveText.trim());
      if (move) {
        const success = onMove(moveText.trim());
        if (success) {
          setMoveText("");
        } else {
          setError("Invalid move for this position");
        }
      } else {
        setError("Invalid move notation");
      }
    } catch (err) {
      setError("Invalid move notation");
    }
  }, [moveText, fen, onMove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="mb-4">
      <label htmlFor="moveInput" className="block text-white/80 text-sm mb-2">
        Enter Move (SAN notation)
      </label>
      <div className="flex flex-col gap-2">
        <input
          id="moveInput"
          type="text"
          value={moveText}
          onChange={(e) => {
            setMoveText(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="e.g. e4, Nf3, O-O"
          className="h-[2.125rem] rounded-lg bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full pr-4 pl-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none"
          style={{ 
            borderColor: error ? 'rgba(255,0,0,0.6)' : 'rgba(255,255,255,0.4)', 
            outline: error ? '1px solid rgba(255,0,0,0.6)' : '1px solid rgba(255,255,255,0.4)', 
            outlineOffset: 1, 
            background: '#181c1f', 
            color: '#fff' 
          }}
          tabIndex={0}
        />
        {error && (
          <div className="text-red-400 text-xs">{error}</div>
        )}
        <div className="text-white/50 text-xs">
          Examples: e4, Nf3, Bxc5, O-O (castling), e8=Q (promotion)
        </div>
      </div>
    </div>
  );
};

export default MoveInput;





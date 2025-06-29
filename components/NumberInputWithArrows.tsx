import React from "react";

interface NumberInputWithArrowsProps {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

const NumberInputWithArrows: React.FC<NumberInputWithArrowsProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  className = ""
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/[^0-9.\-]/g, ""));
  };
  const handleStep = (dir: 1 | -1) => {
    let v = parseFloat(value);
    if (isNaN(v)) v = 0;
    let next = v + dir * step;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(next.toString());
  };
  return (
    <div className={`relative flex items-center ${className}`} style={{ width: '90px' }}>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full bg-[rgba(255,255,255,0.1)] border border-[var(--blue-84)] rounded px-2 py-1 text-white text-sm pr-7 focus:outline-none focus:border-cyan-400 transition-colors"
        style={{ paddingRight: 28 }}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
        <button
          type="button"
          tabIndex={-1}
          className="w-4 h-3 flex items-center justify-center rounded transition"
          style={{ opacity: 0.3 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
          onClick={() => handleStep(1)}
        >
          <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5L6 1L10 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          className="w-4 h-3 flex items-center justify-center rounded transition"
          style={{ opacity: 0.3 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
          onClick={() => handleStep(-1)}
        >
          <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 1L6 5L10 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NumberInputWithArrows; 
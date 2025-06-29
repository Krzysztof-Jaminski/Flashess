import React from "react";

interface AppNumberInputProps {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AppNumberInput: React.FC<AppNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  className = "",
  disabled = false
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
        disabled={disabled}
        className="w-full bg-[rgba(255,255,255,0.1)] border border-[var(--blue-84)] rounded px-2 py-1 text-white text-sm pr-8 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-60"
        style={{ paddingRight: 32 }}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
        <button
          type="button"
          tabIndex={-1}
          className="w-4 h-3 flex items-center justify-center rounded transition"
          style={{ opacity: 0.15 }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.querySelector('svg path')!.setAttribute('stroke', '#fff');
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.15';
            e.currentTarget.querySelector('svg path')!.setAttribute('stroke', '#bbb');
          }}
          onClick={() => handleStep(1)}
          disabled={disabled}
        >
          <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4L5 1L8 4" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          className="w-4 h-3 flex items-center justify-center rounded transition"
          style={{ opacity: 0.15 }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.querySelector('svg path')!.setAttribute('stroke', '#fff');
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.15';
            e.currentTarget.querySelector('svg path')!.setAttribute('stroke', '#bbb');
          }}
          onClick={() => handleStep(-1)}
          disabled={disabled}
        >
          <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 1L5 4L8 1" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AppNumberInput; 
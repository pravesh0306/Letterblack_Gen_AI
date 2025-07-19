import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function Slider({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  className = '',
  disabled = false 
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #4a9eff 0%, #4a9eff ${percentage}%, #333333 ${percentage}%, #333333 100%)`
        }}
      />
      
      {/* Custom thumb */}
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#4a9eff] rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-150"
        style={{
          left: `calc(${percentage}% - 8px)`
        }}
      />
    </div>
  );
}
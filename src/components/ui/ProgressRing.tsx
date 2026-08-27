import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 80,
  strokeWidth = 7,
  color = '#10b981', // emerald-500
  backgroundColor = 'rgba(255, 255, 255, 0.08)',
  showText = true,
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold text-white tracking-tight">{Math.round(percentage)}%</span>
          {label && <span className="text-[9px] font-medium text-slate-400 -mt-0.5">{label}</span>}
        </div>
      )}
    </div>
  );
};

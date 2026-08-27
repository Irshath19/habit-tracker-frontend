import React from 'react';

interface HeatmapDay {
  date: string;
  count: number;
  level: number; // 0 to 4
}

interface HeatmapMatrixProps {
  data: HeatmapDay[];
  onSelectDate?: (date: string) => void;
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({ data, onSelectDate }) => {
  const levelColors = [
    'bg-slate-800/60 hover:bg-slate-700/80',
    'bg-emerald-950 border border-emerald-800/40 text-emerald-300',
    'bg-emerald-800/80 border border-emerald-600/50 text-emerald-200',
    'bg-emerald-600 border border-emerald-400 text-white',
    'bg-emerald-400 border border-emerald-300 text-slate-950 shadow-md shadow-emerald-500/30'
  ];

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-1.5 min-w-[500px]">
        {/* Render columns of 7 days */}
        {Array.from({ length: Math.ceil(data.length / 7) }).map((_, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1.5">
            {data.slice(colIdx * 7, colIdx * 7 + 7).map((day) => (
              <button
                key={day.date}
                onClick={() => onSelectDate?.(day.date)}
                title={`${day.date}: ${day.count} habits completed`}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] transition-all transform hover:scale-125 cursor-pointer ${
                  levelColors[day.level] || levelColors[0]
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-400">
        <span>Less consistent</span>
        <div className="flex gap-1">
          {levelColors.map((col, i) => (
            <div key={i} className={`w-3 h-3 rounded-[3px] ${col.split(' ')[0]}`} />
          ))}
        </div>
        <span>High consistency</span>
      </div>
    </div>
  );
};

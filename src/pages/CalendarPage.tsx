import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2,
  Circle, Flame, ShieldAlert, Sunrise
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch selected day dashboard
  const { data: dayData, isLoading: isDayLoading } = useQuery({
    queryKey: ['today', selectedDate],
    queryFn: () => ApiClient.getTodayDashboard(selectedDate),
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Calendar & History</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect past daily architectures and verify long-term behavioral consistency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View Matrix */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank padding days */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-14 rounded-2xl bg-transparent" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-14 p-2 rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                      : isToday
                      ? 'bg-slate-800/80 border-slate-600 text-slate-200'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : ''}`}>
                    {dayNum}
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Day Inspector</span>
            <h3 className="text-lg font-bold text-white mt-1">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
          </div>

          {isDayLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-800 rounded-xl" />
              <div className="h-16 bg-slate-800 rounded-xl" />
            </div>
          ) : !dayData ? (
            <p className="text-xs text-slate-500">No logs for this date.</p>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Momentum Score</span>
                <span className="font-bold text-emerald-400">{dayData.momentum_score}%</span>
              </div>

              {/* Habits list on that day */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Habits ({dayData.habits_completed_count}/{dayData.habits_total_count})</span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {dayData.build_habits.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{h.name}</span>
                      <span className={`text-[11px] font-bold capitalize ${
                        h.today_status === 'completed' ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {h.today_status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import { Flame, Plus, ChevronRight, CheckCircle2, Circle, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';

export const HabitsPage: React.FC = () => {
  const { openCreateModal } = useUIStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => ApiClient.getHabits(),
  });

  const categories = ['All', ...Array.from(new Set(habits.map((h) => h.category)))];
  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Build System</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Strengthen positive habits through consistent daily micro-commitments.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => openCreateModal('build')} className="font-bold self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <Flame className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No habits in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Design your first habit with identity statements and implementation intentions.
          </p>
          <Button variant="primary" size="sm" onClick={() => openCreateModal('build')}>
            Create Habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => (
            <NavLink
              key={habit.id}
              to={`/app/habits/${habit.id}`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-emerald-950/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconRenderer name={habit.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    🔥 {habit.streak?.current_streak || 0} streak
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {habit.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {habit.identity_statement || habit.description || 'Consistent daily practice'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{habit.goal?.target_value} {habit.goal?.unit}</span>
                <span className="font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Analytics <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

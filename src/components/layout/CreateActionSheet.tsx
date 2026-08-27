import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/stores/useUIStore';
import { ApiClient } from '@/lib/api/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Flame, ShieldAlert, Sunrise, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const CreateActionSheet: React.FC = () => {
  const { isCreateModalOpen, createModalType, closeCreateModal, openCreateModal, addToast, playSoundEffect } = useUIStore();
  const queryClient = useQueryClient();

  // Habit Build Multi-Step Form State
  const [habitStep, setHabitStep] = useState(1);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [habitIcon, setHabitIcon] = useState('Flame');
  const [habitColor, setHabitColor] = useState('emerald');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'specific_days' | 'x_per_week'>('daily');
  const [habitTimePref, setHabitTimePref] = useState('morning');
  const [habitTargetTime, setHabitTargetTime] = useState('07:30');
  const [habitGoalValue, setHabitGoalValue] = useState(1.0);
  const [habitGoalUnit, setHabitGoalUnit] = useState('session');
  const [habitTriggerCue, setHabitTriggerCue] = useState('');
  const [habitIdentity, setHabitIdentity] = useState('');

  // Quit Habit Form State
  const [quitName, setQuitName] = useState('');
  const [quitCategory, setQuitCategory] = useState('Digital');
  const [quitBaseline, setQuitBaseline] = useState(120);
  const [quitTarget, setQuitTarget] = useState(30);
  const [quitUnit, setQuitUnit] = useState('minutes');
  const [quitWhy, setQuitWhy] = useState('');

  // Routine Form State
  const [routineName, setRoutineName] = useState('');
  const [routineTimeOfDay, setRoutineTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [routineScheduledTime, setRoutineScheduledTime] = useState('07:00');
  const [routineSteps, setRoutineSteps] = useState<Array<{ title: string; duration_minutes: number; instructions?: string }>>([
    { title: 'Hydrate & Electrolytes', duration_minutes: 2 },
    { title: 'Mobility & Stretching', duration_minutes: 8 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAll = () => {
    setHabitStep(1);
    setHabitName('');
    setHabitCategory('Health');
    setHabitIcon('Flame');
    setHabitColor('emerald');
    setHabitFrequency('daily');
    setHabitTimePref('morning');
    setHabitTargetTime('07:30');
    setHabitGoalValue(1.0);
    setHabitGoalUnit('session');
    setHabitTriggerCue('');
    setHabitIdentity('');

    setQuitName('');
    setQuitCategory('Digital');
    setQuitBaseline(120);
    setQuitTarget(30);
    setQuitUnit('minutes');
    setQuitWhy('');

    setRoutineName('');
    setRoutineTimeOfDay('morning');
    setRoutineScheduledTime('07:00');
    setRoutineSteps([
      { title: 'Hydrate & Electrolytes', duration_minutes: 2 },
      { title: 'Mobility & Stretching', duration_minutes: 8 }
    ]);
  };

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      addToast({ type: 'warning', title: 'Name required', description: 'Please name your habit.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await ApiClient.createHabit({
        name: habitName.trim(),
        category: habitCategory,
        icon: habitIcon,
        color: habitColor,
        difficulty: 'medium',
        identity_statement: habitIdentity.trim() || `I am becoming someone who practices ${habitName.toLowerCase()} consistently.`,
        schedule: {
          frequency_type: habitFrequency,
          days_of_week: [0,1,2,3,4,5,6],
          target_times_per_week: 7,
          time_preference: habitTimePref,
          target_time: habitTargetTime,
          trigger_cue: habitTriggerCue.trim() || undefined
        },
        goal: {
          target_value: Number(habitGoalValue),
          unit: habitGoalUnit,
          goal_type: habitGoalUnit === 'session' ? 'boolean' : 'numeric'
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      playSoundEffect('complete');
      addToast({ type: 'success', title: 'Habit Created', description: `Your habit "${habitName}" is ready.` });
      closeCreateModal();
      resetAll();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not create habit', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateQuit = async () => {
    if (!quitName.trim()) {
      addToast({ type: 'warning', title: 'Name required', description: 'Please specify the habit to reduce.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await ApiClient.createQuitHabit({
        name: quitName.trim(),
        category: quitCategory,
        icon: 'ShieldAlert',
        color: 'rose',
        unit: quitUnit,
        baseline_value: Number(quitBaseline),
        target_value: Number(quitTarget),
        why_quit: quitWhy.trim() || undefined
      });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['quit_habits'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      playSoundEffect('complete');
      addToast({ type: 'success', title: 'Quit Habit Activated', description: `Progressive reduction for "${quitName}" created.` });
      closeCreateModal();
      resetAll();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not create quit habit', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!routineName.trim()) {
      addToast({ type: 'warning', title: 'Routine name required', description: 'Please name your routine.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await ApiClient.createRoutine({
        name: routineName.trim(),
        icon: routineTimeOfDay === 'morning' ? 'Sunrise' : 'Moon',
        time_of_day: routineTimeOfDay,
        scheduled_time: routineScheduledTime,
        color: routineTimeOfDay === 'morning' ? 'indigo' : 'purple',
        steps: routineSteps.filter(s => s.title.trim()).map((s, idx) => ({
          title: s.title.trim(),
          duration_minutes: Number(s.duration_minutes) || 5,
          step_order: idx,
          instructions: s.instructions
        }))
      });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      playSoundEffect('complete');
      addToast({ type: 'success', title: 'Routine Created', description: `Routine "${routineName}" is ready to run.` });
      closeCreateModal();
      resetAll();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not create routine', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => { closeCreateModal(); resetAll(); }}
      title={
        !createModalType ? 'Create' :
        createModalType === 'build' ? 'Build Positive Habit' :
        createModalType === 'quit' ? 'Reduce / Quit Habit' : 'Design Routine'
      }
      description={
        !createModalType ? 'Choose what you want to add to your daily architecture.' :
        createModalType === 'build' ? `Step ${habitStep} of 4 — Shape your identity` :
        createModalType === 'quit' ? 'Set baseline and step-down milestones' :
        'Sequence your habits into a guided ritual'
      }
      maxWidth="max-w-xl"
    >
      {/* 1. Selector Sheet if no type chosen yet */}
      {!createModalType && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3">
          <button
            onClick={() => openCreateModal('build')}
            className="p-5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/80 flex flex-col items-center text-center transition-all group cursor-pointer hover:bg-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Build Habit</h4>
            <p className="text-xs text-slate-400 mt-1">Exercise, reading, meditation, deep work.</p>
          </button>

          <button
            onClick={() => openCreateModal('quit')}
            className="p-5 rounded-2xl bg-slate-800/80 border border-rose-500/30 hover:border-rose-400/80 flex flex-col items-center text-center transition-all group cursor-pointer hover:bg-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Quit / Reduce</h4>
            <p className="text-xs text-slate-400 mt-1">Social media, gaming, junk food, screen time.</p>
          </button>

          <button
            onClick={() => openCreateModal('routine')}
            className="p-5 rounded-2xl bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-400/80 flex flex-col items-center text-center transition-all group cursor-pointer hover:bg-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sunrise className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Routine</h4>
            <p className="text-xs text-slate-400 mt-1">Morning prime, night wind-down, workday reset.</p>
          </button>
        </div>
      )}

      {/* 2. Build Habit Form (Multi-Step) */}
      {createModalType === 'build' && (
        <div className="space-y-4">
          {habitStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Habit Name</label>
                <input
                  type="text"
                  placeholder="e.g. Read 20 Pages, Strength Training, Meditation"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {['Health', 'Growth', 'Focus', 'Fitness', 'Mindfulness', 'Discipline'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHabitCategory(c)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                        habitCategory === c
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button variant="primary" onClick={() => setHabitStep(2)} disabled={!habitName.trim()}>
                  <span>Next: Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {habitStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Time Preference</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {['morning', 'afternoon', 'evening', 'anytime'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setHabitTimePref(t)}
                      className={`py-2 px-2 text-xs font-medium capitalize rounded-xl border transition-all ${
                        habitTimePref === t
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Target Time (Optional)</label>
                <input
                  type="time"
                  value={habitTargetTime}
                  onChange={(e) => setHabitTargetTime(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Trigger Cue (Implementation Intention)</label>
                <input
                  type="text"
                  placeholder="e.g. Right after morning black coffee"
                  value={habitTriggerCue}
                  onChange={(e) => setHabitTriggerCue(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="secondary" onClick={() => setHabitStep(1)}>Back</Button>
                <Button variant="primary" onClick={() => setHabitStep(3)}>
                  <span>Next: Goal & Unit</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {habitStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Target Value</label>
                  <input
                    type="number"
                    min={1}
                    value={habitGoalValue}
                    onChange={(e) => setHabitGoalValue(Number(e.target.value))}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. pages, mins, session, liters"
                    value={habitGoalUnit}
                    onChange={(e) => setHabitGoalUnit(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Identity Statement</label>
                <textarea
                  rows={2}
                  placeholder={`e.g. I am becoming someone who practices ${habitName || 'this habit'} daily.`}
                  value={habitIdentity}
                  onChange={(e) => setHabitIdentity(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm"
                />
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="secondary" onClick={() => setHabitStep(2)}>Back</Button>
                <Button variant="primary" onClick={() => setHabitStep(4)}>
                  <span>Next: Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {habitStep === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{habitName}</h4>
                    <p className="text-xs text-emerald-300">{habitGoalValue} {habitGoalUnit} • {habitTimePref} ({habitTargetTime})</p>
                  </div>
                </div>
                {habitTriggerCue && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-semibold">Trigger:</span> {habitTriggerCue}
                  </p>
                )}
                <p className="text-xs italic text-slate-400">
                  "{habitIdentity || `I am becoming someone who practices ${habitName} consistently.`}"
                </p>
              </div>

              <div className="flex justify-between pt-3">
                <Button variant="secondary" onClick={() => setHabitStep(3)}>Back</Button>
                <Button variant="primary" onClick={handleCreateHabit} isLoading={isSubmitting} className="font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Habit</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 3. Quit Habit Form */}
      {createModalType === 'quit' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">What do you want to reduce/quit?</label>
            <input
              type="text"
              placeholder="e.g. Endless Social Feeds, Excessive Gaming, Junk Food"
              value={quitName}
              onChange={(e) => setQuitName(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Current Baseline (/day)</label>
              <input
                type="number"
                min={1}
                value={quitBaseline}
                onChange={(e) => setQuitBaseline(Number(e.target.value))}
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Target Ceiling (/day)</label>
              <input
                type="number"
                min={0}
                value={quitTarget}
                onChange={(e) => setQuitTarget(Number(e.target.value))}
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Unit of Measurement</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {['minutes', 'times', 'count'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setQuitUnit(u)}
                  className={`py-2 px-3 text-xs font-medium capitalize rounded-xl border transition-all ${
                    quitUnit === u
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Why is reducing this important to you?</label>
            <textarea
              rows={2}
              placeholder="e.g. Reclaim deep focus, dopamine baseline, and mental peace."
              value={quitWhy}
              onChange={(e) => setQuitWhy(e.target.value)}
              className="w-full mt-1.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => openCreateModal('build')}>Back</Button>
            <Button variant="primary" onClick={handleCreateQuit} isLoading={isSubmitting} className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold">
              Activate Quit Habit
            </Button>
          </div>
        </div>
      )}

      {/* 4. Routine Form */}
      {createModalType === 'routine' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Routine Name</label>
            <input
              type="text"
              placeholder="e.g. Morning Launch Protocol, Evening Wind-Down"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Time of Day</label>
              <select
                value={routineTimeOfDay}
                onChange={(e) => setRoutineTimeOfDay(e.target.value as any)}
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white capitalize"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Scheduled Time</label>
              <input
                type="time"
                value={routineScheduledTime}
                onChange={(e) => setRoutineScheduledTime(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Sequence Steps</label>
              <button
                type="button"
                onClick={() => setRoutineSteps([...routineSteps, { title: '', duration_minutes: 5 }])}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-2 mt-2 max-h-44 overflow-y-auto pr-1">
              {routineSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    placeholder={`Step ${idx + 1} action...`}
                    value={step.title}
                    onChange={(e) => {
                      const copy = [...routineSteps];
                      copy[idx].title = e.target.value;
                      setRoutineSteps(copy);
                    }}
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={step.duration_minutes}
                    onChange={(e) => {
                      const copy = [...routineSteps];
                      copy[idx].duration_minutes = Number(e.target.value);
                      setRoutineSteps(copy);
                    }}
                    className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-center text-white"
                    title="Duration in minutes"
                  />
                  <span className="text-[10px] text-slate-400">min</span>
                  <button
                    type="button"
                    onClick={() => setRoutineSteps(routineSteps.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => openCreateModal('build')}>Back</Button>
            <Button variant="primary" onClick={handleCreateRoutine} isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
              Save Routine
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

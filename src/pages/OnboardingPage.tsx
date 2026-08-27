import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import { Flame, ShieldAlert, CheckCircle2, ArrowRight, Sparkles, HeartPulse, Brain, BookOpen, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Fitness', 'Focus']);
  const [buildHabitName, setBuildHabitName] = useState('Daily 20-Min Workout');
  const [buildCategory, setBuildCategory] = useState('Fitness');
  const [quitHabitName, setQuitHabitName] = useState('Endless Social Media');
  const [quitCategory, setQuitCategory] = useState('Digital');
  const [quitBaseline, setQuitBaseline] = useState(120);
  const [quitTarget, setQuitTarget] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast, playSoundEffect } = useUIStore();
  const navigate = useNavigate();

  const focusOptions = [
    { id: 'Fitness', label: 'Physical Fitness', icon: Dumbbell, desc: 'Exercise, workouts, mobility' },
    { id: 'Focus', label: 'Deep Work & Learning', icon: Brain, desc: 'Coding, studying, reading' },
    { id: 'Mindfulness', label: 'Mental Clarity', icon: Sparkles, desc: 'Meditation, journaling, sleep' },
    { id: 'Health', label: 'Energy & Nutrition', icon: HeartPulse, desc: 'Hydration, diet, recovery' },
  ];

  const toggleFocus = (id: string) => {
    if (selectedFocus.includes(id)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== id));
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Initial Build Habit
      await ApiClient.createHabit({
        name: buildHabitName,
        category: buildCategory,
        icon: 'Flame',
        color: 'emerald',
        difficulty: 'medium',
        identity_statement: `I am becoming someone who consistently practices ${buildHabitName.toLowerCase()}.`,
        schedule: {
          frequency_type: 'daily',
          days_of_week: [0, 1, 2, 3, 4, 5, 6],
          target_times_per_week: 7,
          time_preference: 'morning',
          target_time: '07:30'
        },
        goal: {
          target_value: 1.0,
          unit: 'session',
          goal_type: 'boolean'
        }
      });

      // 2. Create Initial Quit Habit
      await ApiClient.createQuitHabit({
        name: quitHabitName,
        category: quitCategory,
        icon: 'ShieldAlert',
        color: 'rose',
        unit: 'minutes',
        baseline_value: Number(quitBaseline),
        target_value: Number(quitTarget),
        why_quit: 'Reclaim deep attention, dopamine sensitivity, and emotional presence.'
      });

      playSoundEffect('complete');
      addToast({
        type: 'success',
        title: "You're All Set!",
        description: 'Your Habit OS command center has been personalized.'
      });
      navigate('/app/today');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Setup Note', description: err.message || 'Proceeding to dashboard...' });
      navigate('/app/today');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Flame className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">HABIT OS ONBOARDING</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Step {step} of 3</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Core Focus Areas */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    What do you want to elevate first?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select 1 to 3 primary dimensions for your daily routine.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {focusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedFocus.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleFocus(opt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <h4 className="text-sm font-bold text-slate-200">{opt.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={selectedFocus.length === 0}
                  >
                    <span>Next: Build Habit</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Choose First Build Habit */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                    <Flame className="w-3.5 h-3.5" /> BUILD System
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Name your anchor habit
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Start with one keystone action you will perform every day.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Habit Name</label>
                    <input
                      type="text"
                      value={buildHabitName}
                      onChange={(e) => setBuildHabitName(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="e.g. Read 15 pages, Morning Workout, Meditation"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Suggested Templates</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { name: 'Morning Resistance Training', cat: 'Fitness' },
                        { name: 'Read 20 Pages Non-Fiction', cat: 'Growth' },
                        { name: '90-Min Deep Work Block', cat: 'Focus' },
                        { name: '10-Min Vipassana Meditation', cat: 'Mindfulness' },
                      ].map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => { setBuildHabitName(t.name); setBuildCategory(t.cat); }}
                          className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                        >
                          + {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800">
                  <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="primary" size="lg" onClick={() => setStep(3)} disabled={!buildHabitName.trim()}>
                    <span>Next: Quit / Reduce</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Choose First Quit Target */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> QUIT System
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    What behavior do you want to moderate?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    We'll create a step-down ladder so you don't have to quit cold-turkey.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Habit to Reduce</label>
                    <input
                      type="text"
                      value={quitHabitName}
                      onChange={(e) => setQuitHabitName(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-rose-500/50"
                      placeholder="e.g. Endless Social Feeds, Gaming, Late Night Phone"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300">Estimated Current Usage</label>
                      <input
                        type="number"
                        min={1}
                        value={quitBaseline}
                        onChange={(e) => setQuitBaseline(Number(e.target.value))}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">mins per day</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300">First Target Limit</label>
                      <input
                        type="number"
                        min={0}
                        value={quitTarget}
                        onChange={(e) => setQuitTarget(Number(e.target.value))}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">mins per day</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800">
                  <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleFinishOnboarding}
                    isLoading={isSubmitting}
                    className="font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch Habit OS</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

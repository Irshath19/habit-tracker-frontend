import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/useUIStore';
import { ApiClient } from '@/lib/api/client';
import { ShieldAlert, Play, Pause, RotateCcw, Check, Sparkles, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const UrgeDelaySheet: React.FC = () => {
  const { isUrgeSheetOpen, closeUrgeSheet, activeUrgeQuitId, activeUrgeQuitName, addToast, playSoundEffect } = useUIStore();

  const [emotion, setEmotion] = useState('Bored');
  const [intensity, setIntensity] = useState(6);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes default (600s)
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [postFeeling, setPostFeeling] = useState('Better');
  const [outcome, setOutcome] = useState<'resisted' | 'reduced' | 'gave_in'>('resisted');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      playSoundEffect('urge_delay_done');
      addToast({
        type: 'success',
        title: '10-Minute Delay Complete!',
        description: 'You just strengthened your neuroplastic impulse control.'
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, playSoundEffect, addToast]);

  const handleReset = () => {
    setTimeLeft(10 * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!activeUrgeQuitId) {
      addToast({ type: 'info', title: 'Urge Overcome', description: 'Urge delay successfully logged.' });
      closeUrgeSheet();
      return;
    }
    setIsSubmitting(true);
    try {
      await ApiClient.logQuitUrge(activeUrgeQuitId, {
        trigger_emotion: emotion,
        intensity,
        delayed_minutes: Math.max(1, Math.round((600 - timeLeft) / 60)),
        post_delay_feeling: postFeeling,
        outcome,
        notes: notes.trim() || undefined
      });
      addToast({
        type: 'success',
        title: 'Urge Protocol Recorded',
        description: `Outcome: ${outcome}. Your discipline muscle is growing.`
      });
      playSoundEffect('streak');
      closeUrgeSheet();
      handleReset();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not log urge', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const emotionsList = ['Bored', 'Stressed', 'Tired', 'Lonely', 'Habitual', 'Anxious'];

  return (
    <AnimatePresence>
      {isUrgeSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUrgeSheet}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="relative w-full max-w-lg bg-slate-900 border border-rose-500/30 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl shadow-rose-950/40 z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Urge Delay Protocol {activeUrgeQuitName ? `— ${activeUrgeQuitName}` : ''}
                </h3>
                <p className="text-xs text-rose-300">
                  "The urge does not control you. Put 10 minutes between stimulus and response."
                </p>
              </div>
            </div>

            {/* Step 1: Emotion & Intensity */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  What emotion triggered this urge?
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {emotionsList.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmotion(e)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                        emotion === e
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Urge Intensity</span>
                  <span className="text-rose-400 font-bold text-sm">{intensity} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full mt-2 accent-rose-500 cursor-pointer"
                />
              </div>

              {/* 10-Minute Breath & Countdown Circle */}
              <div className="my-6 p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute w-48 h-48 rounded-full bg-rose-500/10 blur-2xl animate-breath pointer-events-none" />

                <div className="w-36 h-36 rounded-full border-4 border-rose-500/30 flex flex-col items-center justify-center relative bg-slate-900/80 backdrop-blur-sm shadow-xl">
                  <HeartPulse className={`w-6 h-6 text-rose-400 mb-1 ${isRunning ? 'animate-pulse text-rose-300' : ''}`} />
                  <span className="text-3xl font-black text-white font-mono tracking-tight">{formattedTime}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Breathe In... Out...</span>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  {!isRunning ? (
                    <Button variant="primary" size="md" onClick={handleStart} className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold shadow-rose-500/20">
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start 10 Min Delay</span>
                    </Button>
                  ) : (
                    <Button variant="secondary" size="md" onClick={handlePause}>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleReset} title="Reset Timer">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reflection Outcome */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  How do you feel now & what is the outcome?
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome('resisted')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      outcome === 'resisted'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Resisted
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('reduced')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      outcome === 'reduced'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Reduced
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('gave_in')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                      outcome === 'gave_in'
                        ? 'bg-slate-700 border-slate-500 text-slate-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    Gave In
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Optional brief reflection note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <Button variant="secondary" onClick={closeUrgeSheet} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} className="flex-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold shadow-rose-500/20">
                  Save Urge Protocol
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

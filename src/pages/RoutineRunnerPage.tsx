import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import {
  Check, Play, Pause, SkipForward, X, Sparkles, CheckCircle2, Clock,
  ArrowRight, Flame, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';

export const RoutineRunnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playSoundEffect, addToast } = useUIStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isRoutineFinished, setIsRoutineFinished] = useState(false);
  const [completedStepsCount, setCompletedStepsCount] = useState(0);

  const { data: routine, isLoading } = useQuery({
    queryKey: ['routine', id],
    queryFn: () => ApiClient.getRoutineById(id!),
    enabled: !!id,
  });

  const completeRoutineMutation = useMutation({
    mutationFn: (stepsCompleted: number) =>
      ApiClient.completeRoutine(id!, {
        steps_completed: stepsCompleted,
        total_steps: routine?.steps.length || 0,
        status: 'completed'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    }
  });

  // Initialize timer for active step
  useEffect(() => {
    if (routine && routine.steps[currentStepIndex]) {
      const stepDuration = routine.steps[currentStepIndex].duration_minutes * 60;
      setSecondsRemaining(stepDuration);
      setIsTimerRunning(true);
    }
  }, [routine, currentStepIndex]);

  // Countdown effect
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      playSoundEffect('routine_step');
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, secondsRemaining, playSoundEffect]);

  if (isLoading || !routine) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white z-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const steps = routine.steps || [];
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const totalSteps = steps.length;
  const progressPct = ((currentStepIndex) / totalSteps) * 100;

  const handleNextStep = (completed = true) => {
    if (completed) {
      setCompletedStepsCount((prev) => prev + 1);
      playSoundEffect('routine_step');
    }
    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finished routine
      setIsRoutineFinished(true);
      const finalCount = completed ? completedStepsCount + 1 : completedStepsCount;
      completeRoutineMutation.mutate(finalCount);
      playSoundEffect('streak');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981']
      });
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col z-50 overflow-hidden select-none">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {currentStepIndex + 1} / {totalSteps}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{routine.name}</h3>
            <span className="text-[11px] text-slate-400">Guided Focus Mode</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/today')}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="Exit Focus Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Top Sequence Progress Line */}
      <div className="w-full bg-slate-900 h-1.5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: isRoutineFinished ? '100%' : `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main Focus Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full relative">
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!isRoutineFinished && currentStep ? (
            <motion.div
              key={currentStep.id || currentStepIndex}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-8 w-full relative z-10"
            >
              {/* Step indicator */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>

              {/* Title & Instructions */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {currentStep.title}
                </h1>
                {currentStep.instructions && (
                  <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                    {currentStep.instructions}
                  </p>
                )}
              </div>

              {/* Countdown Timer Display */}
              <div className="my-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md max-w-sm mx-auto">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Target Duration</span>
                </div>
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {timeFormatted}
                </span>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={() => setSecondsRemaining(currentStep.duration_minutes * 60)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                    title="Reset step timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleNextStep(true)}
                  className="w-full sm:w-auto px-8 font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Done & Next Step</span>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleNextStep(false)}
                  className="w-full sm:w-auto text-slate-400 hover:text-white"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip Step</span>
                </Button>
              </div>

              {/* Next Step Preview */}
              {nextStep && (
                <div className="text-xs text-slate-400 pt-4 flex items-center justify-center gap-1.5">
                  <span>Up next:</span>
                  <strong className="text-slate-200 font-semibold">{nextStep.title}</strong>
                  <span>({nextStep.duration_minutes}m)</span>
                </div>
              )}
            </motion.div>
          ) : (
            /* Finished Celebration Screen */
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-6 text-center max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Routine Complete!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  You successfully executed <strong className="text-emerald-400">{completedStepsCount} of {totalSteps}</strong> steps. Your circadian cadence is locked in.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/app/today')}
                className="w-full font-bold shadow-xl shadow-emerald-500/20"
              >
                <span>Return to Today Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

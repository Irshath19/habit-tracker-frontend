import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

interface UIState {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Command Menu ⌘K
  isCommandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  // Modals & Action sheets
  isCreateModalOpen: boolean;
  createModalType: 'build' | 'quit' | 'routine' | null;
  openCreateModal: (type: 'build' | 'quit' | 'routine') => void;
  closeCreateModal: () => void;

  // Quick Urge Delay Sheet
  isUrgeSheetOpen: boolean;
  activeUrgeQuitId: string | null;
  activeUrgeQuitName: string | null;
  openUrgeSheet: (quitId?: string, quitName?: string) => void;
  closeUrgeSheet: () => void;

  // Sound and Haptic triggers
  playSoundEffect: (type: 'complete' | 'streak' | 'routine_step' | 'urge_delay_done') => void;

  // Toast Alerts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: (localStorage.getItem('habitos_theme') as 'dark' | 'light') || 'dark',
  setTheme: (t) => {
    localStorage.setItem('habitos_theme', t);
    if (t === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({ theme: t });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  isCommandOpen: false,
  setCommandOpen: (open) => set({ isCommandOpen: open }),

  isCreateModalOpen: false,
  createModalType: null,
  openCreateModal: (type) => set({ isCreateModalOpen: true, createModalType: type }),
  closeCreateModal: () => set({ isCreateModalOpen: false, createModalType: null }),

  isUrgeSheetOpen: false,
  activeUrgeQuitId: null,
  activeUrgeQuitName: null,
  openUrgeSheet: (quitId, quitName) => set({
    isUrgeSheetOpen: true,
    activeUrgeQuitId: quitId || null,
    activeUrgeQuitName: quitName || null
  }),
  closeUrgeSheet: () => set({ isUrgeSheetOpen: false, activeUrgeQuitId: null, activeUrgeQuitName: null }),

  playSoundEffect: (type) => {
    // Elegant Web Audio API synthetic cues for maximum performance and zero asset loading delay
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'complete') {
        // High-tech crisp chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'streak') {
        // Multi-frequency harmonic flourish
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'routine_step') {
        // Gentle tactile tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'urge_delay_done') {
        // Zen bell resonance
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.25);
      }
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  },

  toasts: [],
  addToast: (t) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...t, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

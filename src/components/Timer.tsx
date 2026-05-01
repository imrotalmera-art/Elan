
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
}

export default function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (onComplete) onComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center space-y-8 py-8" id="timer-container">
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-neutral-200"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 88}
            initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - timeLeft / duration) }}
            transition={{ duration: 1, ease: "linear" }}
            className="text-stone-800"
          />
        </svg>
        <div className="absolute text-5xl font-light tracking-tight text-stone-800 font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {!isFinished ? (
          <>
            <button
              id="toggle-timer"
              onClick={toggle}
              className="p-4 rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-colors shadow-sm"
              aria-label={isActive ? "Pause" : "Démarrer"}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              id="reset-timer"
              onClick={reset}
              className="p-4 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors shadow-sm"
              aria-label="Réinitialiser"
            >
              <RotateCcw size={20} />
            </button>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-2 text-stone-600"
          >
            <CheckCircle size={48} className="text-emerald-500" />
            <span className="text-sm font-medium">Mission accomplie</span>
            <button
              onClick={reset}
              className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors mt-4"
            >
              Recommencer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

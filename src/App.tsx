/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, LayoutGrid, Loader2 } from 'lucide-react';
import { Mission } from './constants';
import Timer from './components/Timer';
import { generateMissionForGoal } from './services/geminiService';

export default function App() {
  const [goal, setGoal] = useState('');
  const [mission, setMission] = useState<Mission | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCycleComplete, setIsCycleComplete] = useState(false);
  const [dayCount, setDayCount] = useState(0);

  useEffect(() => {
    // Check if a mission was already completed today
    const lastSuccess = localStorage.getItem('last_mission_success');
    const today = new Date().toDateString();
    
    // Load day counter
    const savedCount = localStorage.getItem('mission_day_count');
    const currentCount = savedCount ? parseInt(savedCount, 10) : 0;
    setDayCount(currentCount);

    // If they already finished the 3 days in the past or just now
    if (currentCount >= 3) {
      setIsCycleComplete(true);
      return;
    }

    if (lastSuccess === today) {
      setIsCompleted(true);
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    try {
      const generated = await generateMissionForGoal(goal);
      setMission({
        id: Date.now(),
        ...generated
      });
      setIsRevealed(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    const nextCount = dayCount + 1;
    setDayCount(nextCount);
    localStorage.setItem('mission_day_count', nextCount.toString());
    localStorage.setItem('last_mission_success', new Date().toDateString());

    if (nextCount >= 3) {
      setIsCycleComplete(true);
    } else {
      setIsCompleted(true);
    }
  };

  const resetAll = () => {
    setIsRevealed(false);
    setGoal('');
    setIsCompleted(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900">
      <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] font-medium text-stone-400"
          id="app-logo"
        >
          Élan
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-4 text-stone-400"
        >
          <div className="flex items-center space-x-2">
            <LayoutGrid size={16} />
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Jour {dayCount} / 3
            </span>
          </div>
          <div className="h-4 w-[1px] bg-stone-200"></div>
          <span className="text-[10px] uppercase tracking-widest">
            {mission?.duration || 7} Minutes
          </span>
        </motion.div>
      </header>

      <main className="relative flex flex-col items-center justify-center min-h-screen px-6 max-w-2xl mx-auto py-24">
        <AnimatePresence mode="wait">
          {isCycleComplete ? (
            <motion.div
              key="cycle-complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-12"
              id="cycle-complete-section"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-stone-800 text-white p-8 rounded-full shadow-xl"
                >
                  <Sparkles size={64} />
                </motion.div>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: (Math.random() - 0.5) * 300,
                      y: (Math.random() - 0.5) * 300,
                    }}
                    transition={{ 
                      duration: 3, 
                      delay: i * 0.2, 
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 text-stone-400"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-serif italic text-stone-800 leading-tight">
                  Un nouveau souffle.
                </h1>
                <p className="text-stone-500 text-lg font-light max-w-md mx-auto leading-relaxed">
                  Tu as complété ton cycle de 3 jours. Ton élan est maintenant lancé. 
                </p>
                <p className="text-stone-400 text-sm font-light max-w-xs mx-auto italic">
                  Pour continuer à cultiver ton intention chaque jour et accéder à des missions illimitées, rejoins l'expérience complète.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Reset for testing/demo purposes as requested
                  setDayCount(0);
                  localStorage.setItem('mission_day_count', '0');
                  localStorage.removeItem('last_mission_success');
                  setIsCycleComplete(false);
                  resetAll();
                }}
                className="inline-flex items-center space-x-4 bg-stone-800 text-white px-10 py-5 rounded-full shadow-lg hover:bg-stone-900 transition-all"
              >
                <span className="text-sm font-medium tracking-widest uppercase">Débloquer Élan Premium (Mode Test)</span>
                <ArrowRight size={18} />
              </motion.button>

              <div className="pt-4">
                <span className="text-[10px] uppercase tracking-widest text-stone-300">
                  Merci d'avoir fait battre ton cœur avec nous.
                </span>
              </div>
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
              id="success-section"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                  className="bg-emerald-50 text-emerald-600 p-6 rounded-full"
                >
                  <Sparkles size={48} />
                </motion.div>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0, x: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: -100 - Math.random() * 50,
                      x: (Math.random() - 0.5) * 100 
                    }}
                    transition={{ duration: 2, delay: 0.2 + i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute top-1/2 left-1/2 text-emerald-400"
                  >
                    <div className="text-xl">✨</div>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-serif italic text-stone-800">Mission accomplie.</h1>
                <p className="text-stone-400 font-light text-lg">Ta graine est plantée pour aujourd'hui.</p>
              </div>
              <button
                onClick={resetAll}
                className="text-[10px] uppercase tracking-[0.3em] text-stone-300 hover:text-stone-600 transition-colors pt-8"
              >
                Nouvelle intention
              </button>
            </motion.div>
          ) : !isRevealed ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center w-full max-w-md space-y-12"
              id="intro-section"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-800 leading-tight">
                  Que souhaites-tu <span className="italic font-serif">cultiver</span> ?
                </h1>
                <p className="text-stone-400 text-lg font-light">
                  Partage ton intention pour aujourd'hui.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="relative group">
                  <input
                    id="goal-input"
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Ex: la patience, ma créativité, m'apaiser..."
                    className="w-full bg-transparent border-b-2 border-stone-200 py-4 px-1 text-xl md:text-2xl font-light focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-200"
                    disabled={isLoading}
                    autoFocus
                  />
                  {isLoading && (
                    <div className="absolute right-0 bottom-4 animate-spin text-stone-400">
                      <Loader2 size={24} />
                    </div>
                  )}
                </div>

                <motion.button
                  id="reveal-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !goal.trim()}
                  className="group relative inline-flex items-center space-x-4 bg-white border border-stone-200 px-8 py-5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-medium tracking-wide">
                    {isLoading ? "Génération en cours..." : "Créer ma mission"}
                  </span>
                  {!isLoading && (
                    <div className="p-1 rounded-full bg-stone-50 group-hover:bg-stone-100 transition-colors">
                      <ArrowRight size={18} className="text-stone-400 group-hover:text-stone-800 transition-colors" />
                    </div>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="mission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="w-full space-y-12"
              id="mission-section"
            >
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-stone-100 rounded-full text-stone-400 mb-2">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-sm uppercase tracking-[0.4em] font-semibold text-stone-400">
                  Ta Mission sur Mesure
                </h2>
                <h3 className="text-3xl md:text-4xl font-serif italic text-stone-800 leading-tight px-4">
                  {mission?.title}
                </h3>
                <p className="text-stone-500 text-lg font-light leading-relaxed max-w-lg mx-auto">
                  {mission?.description}
                </p>
              </div>

              <div className="pt-8 border-t border-stone-100 flex flex-col items-center space-y-12">
                <Timer duration={(mission?.duration || 7) * 60} />
                
                <motion.button
                  id="complete-mission-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-8 py-4 rounded-full text-sm font-medium tracking-wide shadow-sm hover:bg-emerald-100 transition-colors flex items-center space-x-3"
                >
                  <Sparkles size={18} />
                  <span>Mission accomplie</span>
                </motion.button>
              </div>

              <div className="text-center">
                <button
                  id="back-home"
                  onClick={() => setIsRevealed(false)}
                  className="text-[10px] uppercase tracking-[0.3em] text-stone-300 hover:text-stone-500 transition-colors"
                >
                  Définir un nouvel objectif
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
          Présence • Clarté • Élan
        </div>
      </footer>
    </div>
  );
}

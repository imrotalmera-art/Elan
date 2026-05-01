import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, LayoutGrid, Loader2, Lightbulb, Target, Plus, ChevronLeft, History, Trash2, Calendar, Flame } from 'lucide-react';
import { Mission } from './constants';
import Timer from './components/Timer';
import { generateMissionForGoal } from './services/geminiService';

interface MissionEntry {
  mission: Mission;
  date: string; // ISO Date String (YYYY-MM-DD)
}

interface Domain {
  id: string;
  name: string;
  cycleDuration: number;
  createdAt: string; // ISO string
  missionHistory: MissionEntry[];
  lastSuccess: string | null; // ISO Date String (YYYY-MM-DD)
  streak: number;
  longestStreak: number;
}

export default function App() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'mission' | 'history'>('dashboard');
  
  const [newGoal, setNewGoal] = useState('');
  const [newDuration, setNewDuration] = useState(7);
  const [mission, setMission] = useState<Mission | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletedNow, setIsCompletedNow] = useState(false);

  useEffect(() => {
    const savedDomains = localStorage.getItem('elan_domains_v3');
    if (savedDomains) {
      const parsed = JSON.parse(savedDomains);
      const updated = parsed.map((d: Domain) => checkAndFixStreak(d));
      setDomains(updated);
    }
  }, []);

  useEffect(() => {
    if (domains.length > 0) {
      localStorage.setItem('elan_domains_v3', JSON.stringify(domains));
    }
  }, [domains]);

  const checkAndFixStreak = (domain: Domain): Domain => {
    if (!domain.lastSuccess) return domain;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(domain.lastSuccess);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If more than 1 day passed, streak is broken
    if (diffDays > 1) {
      return { ...domain, streak: 0 };
    }
    return domain;
  };

  const activeDomain = domains.find(d => d.id === activeDomainId);

  const createDomain = (e: FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim() || domains.length >= 3) return;

    const newDomain: Domain = {
      id: Date.now().toString(),
      name: newGoal.trim(),
      cycleDuration: newDuration,
      createdAt: new Date().toISOString(),
      missionHistory: [],
      lastSuccess: null,
      streak: 0,
      longestStreak: 0
    };

    const updated = [...domains, newDomain];
    setDomains(updated);
    setNewGoal('');
    setNewDuration(7);
  };

  const deleteDomain = (id: string) => {
    const updated = domains.filter(d => d.id !== id);
    setDomains(updated);
    if (activeDomainId === id) setActiveDomainId(null);
  };

  const handleGenerate = async () => {
    if (!activeDomain) return;

    setIsLoading(true);
    try {
      const generated = await generateMissionForGoal(activeDomain.name);
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
    if (!activeDomain || !mission) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newStreak = activeDomain.streak + 1;
    
    const updatedDomains = domains.map(d => {
      if (d.id === activeDomainId) {
        return {
          ...d,
          streak: newStreak,
          longestStreak: Math.max(d.longestStreak, newStreak),
          missionHistory: [{ mission, date: todayStr }, ...d.missionHistory],
          lastSuccess: todayStr
        };
      }
      return d;
    });

    setDomains(updatedDomains);
    setIsCompletedNow(true);
  };

  const selectDomain = (id: string) => {
    setActiveDomainId(id);
    setIsRevealed(false);
    setIsCompletedNow(false);
    setView('mission');
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysSinceCreation = (isoString: string) => {
    const start = new Date(isoString);
    const today = new Date();
    const diff = today.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900">
      <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-20 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs uppercase tracking-[0.3em] font-medium text-stone-400 cursor-pointer pointer-events-auto"
          onClick={() => setView('dashboard')}
        >
          Élan
        </motion.div>
        
        <div className="flex items-center space-x-6 text-stone-400 pointer-events-auto">
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className="flex items-center space-x-2 text-[10px] uppercase tracking-widest hover:text-stone-800 transition-colors">
              <ChevronLeft size={14} />
              <span>Dashboard</span>
            </button>
          )}
        </div>
      </header>

      <main className="relative flex flex-col items-center justify-center min-h-screen px-6 max-w-2xl mx-auto py-24 w-full">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-800">Tes <span className="italic font-serif">Élans</span></h1>
                <p className="text-stone-400 font-light text-sm">Plusieurs racines, une seule croissance.</p>
              </div>

              <div className="grid gap-6">
                {domains.map((domain) => (
                  <motion.div
                    key={domain.id}
                    layoutId={domain.id}
                    className="bg-white border border-stone-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => { setActiveDomainId(domain.id); setView('history'); }} className="p-2 text-stone-300 hover:text-stone-800 transition-colors">
                        <History size={16} />
                      </button>
                      <button onClick={() => deleteDomain(domain.id)} className="p-2 text-stone-300 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="cursor-pointer" onClick={() => selectDomain(domain.id)}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-1.5 w-24 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-stone-800 transition-all duration-1000" 
                            style={{ width: `${Math.min((domain.missionHistory.length / domain.cycleDuration) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                          {domain.missionHistory.length} / {domain.cycleDuration} jours
                        </span>
                      </div>
                      
                      <div className="text-2xl font-serif italic text-stone-800 mb-4">{domain.name}</div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-full ${domain.streak > 0 ? 'bg-orange-50 text-orange-600' : 'bg-stone-50 text-stone-300'}`}>
                            <Flame size={14} fill={domain.streak > 0 ? "currentColor" : "none"} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">Série</span>
                            <span className="text-sm font-medium text-stone-800">{domain.streak} j</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-stone-50 text-stone-400">
                            <Calendar size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">Depuis</span>
                            <span className="text-sm font-medium text-stone-800">{getDaysSinceCreation(domain.createdAt)} j</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {domains.length < 3 && (
                  <div className="bg-stone-50/50 border-2 border-dashed border-stone-200 p-8 rounded-[2.5rem] space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-stone-400 block ml-1 font-bold">Nouveau Bot / Domaine</label>
                        <input
                          type="text"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="Ex: Séduction, Stoïcisme..."
                          className="w-full bg-transparent border-b-2 border-stone-200 py-3 px-1 text-xl font-light focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-200"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-stone-400 block ml-1 font-bold">Durée du cycle (jours)</label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {[7, 21, 30].map(d => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setNewDuration(d)}
                                className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${newDuration === d ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'}`}
                              >
                                {d} j
                              </button>
                            ))}
                            <div className="flex items-center space-x-2 pl-2">
                              <input 
                                type="number" 
                                value={newDuration} 
                                onChange={(e) => setNewDuration(parseInt(e.target.value) || 1)}
                                className="w-10 bg-transparent text-sm text-center border-b border-stone-300 focus:outline-none focus:border-stone-800 font-medium"
                              />
                            </div>
                          </div>
                          
                          <button 
                            onClick={createDomain}
                            disabled={!newGoal.trim()}
                            className="p-4 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-all shadow-lg disabled:opacity-10 active:scale-95"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : view === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xs uppercase tracking-[0.4em] text-stone-400 font-bold">Mémoire de l'Élan</h2>
                    <h1 className="text-4xl font-serif italic text-stone-800 leading-tight">{activeDomain?.name}</h1>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                  <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                    <div className="text-stone-300 mb-1">Créé le</div>
                    <div className="text-stone-800">{activeDomain ? formatDate(activeDomain.createdAt) : '-'}</div>
                  </div>
                  <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                    <div className="text-stone-300 mb-1">Missions</div>
                    <div className="text-stone-800">{activeDomain?.missionHistory.length} accomplies</div>
                  </div>
                  <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                    <div className="text-stone-300 mb-1">Série Actuelle</div>
                    <div className="text-orange-600 font-black">{activeDomain?.streak} j</div>
                  </div>
                  <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                    <div className="text-stone-300 mb-1">Record</div>
                    <div className="text-stone-800 font-black">{activeDomain?.longestStreak} j</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black border-b border-stone-100 pb-4">Chronologie des Exercices</h3>
                {(activeDomain?.missionHistory.length || 0) === 0 ? (
                  <div className="text-center py-20 bg-stone-50/50 rounded-[2.5rem] border border-stone-100 border-dashed">
                    <p className="text-stone-300 italic font-light">Aucune mission n'a encore été semée.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeDomain?.missionHistory.map((entry, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-3 relative overflow-hidden group hover:border-stone-800 transition-colors"
                      >
                         <div className="absolute top-0 right-0 p-6 text-[40px] font-serif font-black italic text-stone-50/50 group-hover:text-stone-100/50 transition-colors pointer-events-none">
                          {activeDomain.missionHistory.length - i}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-300 flex items-center space-x-2">
                           <Calendar size={10} />
                           <span>Le {new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <h4 className="font-serif italic text-xl text-stone-800">{entry.mission.title}</h4>
                        <p className="text-sm text-stone-500 font-light leading-relaxed pr-8">{entry.mission.description}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center pt-8">
                 <button
                  onClick={() => setView('dashboard')}
                  className="inline-flex items-center space-x-3 text-[10px] uppercase tracking-[0.4em] font-bold text-stone-300 hover:text-stone-800 transition-all border-b border-transparent hover:border-stone-800 pb-1"
                >
                  <ChevronLeft size={12} />
                  <span>Quitter la mémoire</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {isCompletedNow || (activeDomain && activeDomain.lastSuccess === new Date().toISOString().split('T')[0] && !isRevealed) ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-10 w-full"
                >
                  <div className="relative inline-block">
                    <div className="bg-emerald-50 text-emerald-600 p-10 rounded-full inline-block shadow-inner">
                      {activeDomain && activeDomain.streak > 0 ? (
                        <div className="flex flex-col items-center">
                          <Flame size={40} fill="currentColor" className="animate-pulse" />
                          <span className="text-2xl font-serif font-black italic mt-1">{activeDomain.streak}</span>
                        </div>
                      ) : (
                        <Sparkles size={48} />
                      )}
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg"
                    >
                      SUCCESS
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-4xl font-serif italic text-stone-800">
                      {activeDomain && activeDomain.streak > 1 ? `Série de ${activeDomain.streak} jours !` : "L'Élan est ancré."}
                    </h1>
                    <p className="text-stone-400 font-light text-lg">Ta mission quotidienne pour "{activeDomain?.name}" est accomplie.</p>
                  </div>

                  <div className="pt-10 flex flex-col items-center space-y-6">
                    <button 
                      onClick={() => setView('dashboard')} 
                      className="bg-stone-800 text-white px-10 py-5 rounded-full shadow-lg hover:bg-stone-900 transition-all text-sm font-medium tracking-widest uppercase hover:scale-105 active:scale-95"
                    >
                      Retour au Dashboard
                    </button>
                    <button 
                      onClick={() => setView('history')} 
                      className="text-[10px] uppercase tracking-widest font-bold text-stone-300 hover:text-stone-800 transition-colors"
                    >
                      Voir ma progression
                    </button>
                  </div>
                </motion.div>
              ) : activeDomain && activeDomain.missionHistory.length >= activeDomain.cycleDuration ? (
                 <motion.div
                  key="cycle-finish"
                  className="text-center space-y-12"
                >
                  <div className="relative">
                    <div className="bg-stone-800 text-white p-12 rounded-full inline-block shadow-2xl">
                      <Target size={56} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h1 className="text-5xl font-serif italic text-stone-800 leading-tight">Cycle de {activeDomain.cycleDuration} jours fleuri.</h1>
                    <p className="text-stone-500 text-xl font-light leading-relaxed max-w-md mx-auto">
                      Ton engagement envers <span className="text-stone-800 font-medium italic">"{activeDomain.name}"</span> a porté ses fruits. Tu as maintenant une fondation solide.
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-6">
                    <button onClick={() => {
                      const updated = domains.map(d => d.id === activeDomainId ? { ...d, missionHistory: [], streak: 0, lastSuccess: null } : d);
                      setDomains(updated);
                      setIsRevealed(false);
                      setIsCompletedNow(false);
                    }} className="bg-stone-800 text-white px-12 py-6 rounded-full shadow-xl hover:bg-stone-900 transition-all text-sm font-black tracking-widest uppercase hover:scale-105 active:scale-95">
                      Relancer un cycle plus long
                    </button>
                    <button 
                      onClick={() => setView('dashboard')} 
                      className="text-[10px] uppercase tracking-widest font-bold text-stone-300 hover:text-stone-800 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </motion.div>
              ) : !isRevealed ? (
                <motion.div
                  key="ready"
                  className="text-center space-y-12 w-full"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${activeDomain?.streak === 0 && activeDomain.missionHistory.length > 0 ? "bg-red-50 text-red-400" : "bg-stone-100 text-stone-400"}`}>
                        {activeDomain?.streak === 0 && activeDomain.missionHistory.length > 0 ? "Chaîne rompue" : <><Flame size={10} /> <span>{activeDomain?.streak} j</span></>}
                      </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif italic text-stone-800 leading-tight">{activeDomain?.name}</h1>
                    <div className="flex items-center justify-center space-x-4">
                       <p className="text-stone-400 text-xs font-light uppercase tracking-[0.3em]">
                         Jour {activeDomain ? activeDomain.missionHistory.length + 1 : 1} <span className="opacity-30">/</span> {activeDomain?.cycleDuration}
                       </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="group relative border border-stone-200 px-12 py-7 rounded-full bg-white shadow-sm flex items-center space-x-6 mx-auto hover:shadow-xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-stone-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative text-sm font-black tracking-widest uppercase text-stone-800">
                      {isLoading ? "Consultation..." : "Révéler la mission"}
                    </span>
                    {isLoading ? <Loader2 className="relative animate-spin text-stone-400" size={20} /> : <ArrowRight size={20} className="relative text-stone-300 group-hover:text-stone-800 translate-x-0 group-hover:translate-x-1 transition-all" />}
                  </motion.button>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => setView('history')} 
                      className="text-[10px] uppercase tracking-widest font-bold text-stone-300 hover:text-stone-500 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <History size={12} />
                      <span>Mémoire de cet élan</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mission-active"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-12"
                >
                   <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-stone-100 rounded-full text-stone-800 mb-2 shadow-inner">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-serif italic text-stone-800 leading-tight px-4 text-center">
                      {mission?.title}
                    </h3>
                    <p className="text-stone-600 text-xl font-light leading-relaxed max-w-lg mx-auto text-center italic">
                      {mission?.description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-stone-100 p-8 rounded-[2.5rem] space-y-4 shadow-sm">
                      <div className="flex items-center space-x-3 text-stone-400">
                        <Target size={18} className="text-stone-300" />
                        <span className="text-[11px] uppercase tracking-[0.2em] font-black">L'Éveil</span>
                      </div>
                      <p className="text-sm text-stone-500 font-light italic leading-relaxed">
                        {mission?.benefit}
                      </p>
                    </div>
                    <div className="bg-stone-900 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
                      <div className="flex items-center space-x-3 text-stone-500">
                        <Lightbulb size={18} className="text-amber-400" />
                        <span className="text-[11px] uppercase tracking-[0.2em] font-black text-stone-400">Guidance</span>
                      </div>
                      <p className="text-sm text-stone-300 font-light leading-relaxed">
                        {mission?.guidance}
                      </p>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-stone-100 flex flex-col items-center space-y-16">
                    <Timer duration={(mission?.duration || 5) * 60} />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleComplete}
                      className="bg-stone-800 text-white px-12 py-6 rounded-full text-sm font-black tracking-[0.2em] uppercase flex items-center space-x-4 shadow-2xl hover:bg-stone-900 transition-all"
                    >
                      <Sparkles size={20} />
                      <span>Ancrer la mission</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 text-center pointer-events-none z-10">
        <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-200">
          Élan • Présence • Harmonie
        </div>
      </footer>
    </div>
  );
}

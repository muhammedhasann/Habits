
import React, { useState, useEffect } from 'react';
import { DAILY_PROTOCOL } from '../constants';
import { Habit, HabitSuggestion } from '../types';
import { CheckCircle2, Flame, Plus, PlayCircle, Sparkles, RefreshCw, Target, Star, Pin, Quote } from 'lucide-react';
import { suggestNewHabits } from '../services/geminiService';
import { addXP, getUserProfile, getUserData, saveUserData } from '../services/integrationService';
import ConfirmationModal from './ConfirmationModal';
import VideoModal from './VideoModal';

const HabitTracker: React.FC = () => {
  const [completed, setCompleted] = useState<string[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [plan, setPlan] = useState<{ mit: string, top3: string[], quote: string } | null>(null);
  const [xpNotification, setXpNotification] = useState<number | null>(null);
  
  const [streak, setStreak] = useState(0);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customHabits, setCustomHabits] = useState<Habit[]>([]);

  const [uncheckId, setUncheckId] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean, videoId: string | null, title: string }>({
      isOpen: false, videoId: null, title: ''
  });

  useEffect(() => {
    const saved = getUserData<any>(`log-${today}`);
    if (saved) {
      setCompleted(saved.completedHabitIds || []);
      if (saved.plan) setPlan(saved.plan);
    }
    const savedCustom = getUserData<Habit[]>('custom-habits');
    if(savedCustom) setCustomHabits(savedCustom);

    calculateStreak();
  }, [today]);

  const calculateStreak = () => {
    let currentStreak = 0;
    const d = new Date();
    
    for (let i = 0; i < 365; i++) {
        const dateStr = d.toISOString().split('T')[0];
        const log = getUserData<any>(`log-${dateStr}`);
        if (log) {
            const count = log.completedHabitIds?.length || 0;
            if (count >= 5) {
                currentStreak++;
            } else if (i > 0) {
                break; 
            }
        } else if (i > 0) {
            break;
        }
        d.setDate(d.getDate() - 1);
    }
    setStreak(currentStreak);
  };

  const handleHabitClick = (id: string) => {
      if (completed.includes(id)) {
          setUncheckId(id);
      } else {
          toggleHabit(id, true);
      }
  };

  const toggleHabit = (id: string, isChecking: boolean) => {
    let newCompleted = [];
    if (!isChecking) {
        newCompleted = completed.filter(c => c !== id);
    } else {
        newCompleted = [...completed, id];
        const { newState, leveledUp } = addXP(50);
        triggerXpAnim(50);
    }
    
    setCompleted(newCompleted);
    updateStorage(newCompleted);
    setUncheckId(null);
  };

  const updateStorage = (newCompleted: string[]) => {
    const current = getUserData<any>(`log-${today}`) || { date: today };
    current.completedHabitIds = newCompleted;
    saveUserData(`log-${today}`, current);
  };

  const triggerXpAnim = (amount: number) => {
    setXpNotification(amount);
    setTimeout(() => setXpNotification(null), 2000);
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    const profile = getUserProfile();
    const allHabits = [...DAILY_PROTOCOL, ...customHabits];
    const newSuggestions = await suggestNewHabits(profile, allHabits);
    setSuggestions(newSuggestions);
    setLoadingSuggestions(false);
  };

  const addSuggestedHabit = (sug: HabitSuggestion) => {
      const newHabit: Habit = {
          id: `custom-${Date.now()}`,
          title: sug.title,
          description: sug.description,
          benefit: sug.benefit,
          category: 'Morning',
          type: 'daily',
          time: 'Any',
          videoId: sug.videoId
      };
      const updatedCustom = [...customHabits, newHabit];
      setCustomHabits(updatedCustom);
      saveUserData('custom-habits', updatedCustom);

      setSuggestions(suggestions.filter(s => s.title !== sug.title));
      triggerXpAnim(20); 
  };

  const openVideo = (e: React.MouseEvent, id: string | undefined, title: string) => {
      e.stopPropagation();
      if(id) setVideoModal({ isOpen: true, videoId: id, title });
  };

  const allDisplayHabits = [...DAILY_PROTOCOL, ...customHabits];
  const groupedHabits = {
    Morning: allDisplayHabits.filter(h => h.category === 'Morning'),
    'Deep Work': allDisplayHabits.filter(h => h.category === 'Deep Work'),
    Afternoon: allDisplayHabits.filter(h => h.category === 'Afternoon'),
    Evening: allDisplayHabits.filter(h => h.category === 'Evening'),
  };

  const progress = (completed.length / allDisplayHabits.length) * 100;

  return (
    <div className="space-y-8 relative">
      <ConfirmationModal 
        isOpen={!!uncheckId}
        title="Hold up!"
        message="Unchecking this reduces your daily score. Are you sure?"
        onConfirm={() => uncheckId && toggleHabit(uncheckId, false)}
        onCancel={() => setUncheckId(null)}
      />

      <VideoModal 
         isOpen={videoModal.isOpen}
         videoId={videoModal.videoId}
         title={videoModal.title}
         onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
      />

      {xpNotification && (
        <div className="fixed bottom-24 right-10 z-[60] animate-bounce text-neon-cyan font-bold text-3xl flex items-center gap-2 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] pointer-events-none">
            + {xpNotification} XP <Star className="fill-neon-cyan" />
        </div>
      )}

      {/* Header with Streak */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">Daily Protocol</h2>
                <div className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-gray-400">{today}</div>
           </div>
           <div className="flex items-center gap-4">
                <p className="text-gray-400 text-sm">Execute the plan. Capture the day.</p>
           </div>
        </div>
        
        {/* Streak & Progress */}
        <div className="flex gap-4 items-end">
            {/* Streak Widget */}
            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border backdrop-blur-md transition-all ${
                streak >= 7 ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
                'bg-white/5 border-white/10 text-gray-400'
            }`}>
                <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${streak >= 7 ? 'fill-orange-500 animate-pulse' : 'text-gray-500'}`} />
                    <span className="text-3xl font-bold leading-none font-mono">{streak}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Day Streak</span>
            </div>
            
            {/* Progress Widget */}
            <div className="bg-glass-bg p-4 rounded-2xl border border-glass-border min-w-[120px]">
                <div className="text-3xl font-mono font-bold text-neon-cyan leading-none mb-2 text-right">{Math.round(progress)}%</div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-neon-cyan transition-all duration-500 relative shadow-[0_0_10px_#00f3ff]" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
      </div>

      {/* Pinned Plan HUD */}
      {plan && (
         <div className="bg-[#050507] border border-neon-cyan/30 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.05)] group animate-in fade-in slide-in-from-top-4">
            
            {/* HUD Elements */}
            <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan" />
            <div className="absolute top-4 right-4">
                 <Pin className="w-4 h-4 text-neon-cyan rotate-45 opacity-50" />
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-neon-cyan mb-3">
                        <Target className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Prime Objective (MIT)</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">{plan.mit}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.top3.map((goal, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                <span className="text-neon-purple font-mono font-bold text-lg opacity-50">0{i+1}</span>
                                <span className="text-sm text-gray-300 font-medium leading-tight truncate">{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Mantra Section */}
                <div className="border-l border-white/10 pl-8 flex flex-col justify-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-neon-purple/5 to-transparent opacity-50 pointer-events-none" />
                    <p className="text-xs text-gray-500 uppercase mb-4 font-bold tracking-widest flex items-center gap-2">
                        <Quote className="w-3 h-3" /> Daily Mantra
                    </p>
                    <p className="text-xl italic text-gray-200 font-serif leading-relaxed">
                        "{plan.quote}"
                    </p>
                </div>
            </div>
         </div>
      )}

      {/* AI Suggestions Section */}
      <div className="bg-glass-bg border border-glass-border p-6 rounded-3xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 relative z-10">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-purple" /> 
                    AI Protocol Optimization
                </h3>
                <p className="text-xs text-gray-500 mt-1">Personalized habit stack based on your goals.</p>
            </div>
            <button 
                onClick={handleGetSuggestions}
                className="px-4 py-2 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
                {loadingSuggestions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {loadingSuggestions ? 'Scanning...' : 'Find New Habits'}
            </button>
        </div>
        
        {showSuggestions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
                {suggestions.length > 0 ? suggestions.map((s, i) => (
                    <div key={i} className="bg-black/40 border border-white/10 p-5 rounded-2xl relative group hover:border-neon-purple/50 transition-colors hover:bg-black/60">
                        <button 
                            onClick={() => addSuggestedHabit(s)} 
                            className="absolute top-3 right-3 p-2 bg-neon-purple text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500 shadow-[0_0_10px_#bc13fe]"
                            title="Add to Protocol"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <h4 className="font-bold text-white mb-2 pr-8">{s.title}</h4>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">{s.description}</p>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded border border-neon-cyan/20">{s.benefit}</span>
                             <span className="text-[10px] text-gray-500">{s.reason}</span>
                        </div>
                    </div>
                )) : !loadingSuggestions && (
                    <div className="col-span-3 text-center text-gray-600 text-sm py-8">
                        Tap the button to analyze your routine and find gaps.
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Habit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groupedHabits).map(([category, habits]) => (
          <div key={category} className="bg-[#050507] border border-glass-border rounded-3xl p-6 relative overflow-hidden hover:border-white/20 transition-colors duration-500">
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className={`w-2 h-2 rounded-full ${
                category === 'Morning' ? 'bg-yellow-400 shadow-[0_0_10px_orange]' :
                category === 'Deep Work' ? 'bg-neon-cyan shadow-[0_0_10px_#00f3ff]' :
                category === 'Afternoon' ? 'bg-blue-500 shadow-[0_0_10px_blue]' :
                'bg-purple-500 shadow-[0_0_10px_purple]'
              }`} />
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-300">{category}</h3>
            </div>

            <div className="space-y-3">
              {habits.map((habit) => {
                const isDone = completed.includes(habit.id);
                return (
                <div 
                  key={habit.id}
                  onClick={() => handleHabitClick(habit.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
                    isDone 
                      ? 'bg-green-500/5 border-green-500/20 opacity-80' 
                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {/* Checkbox Visual */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isDone ? 'border-green-500 bg-green-500 text-black' : 'border-gray-600 group-hover:border-white'
                  }`}>
                      {isDone && <div className="particle-burst absolute" />}
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold truncate pr-2 ${isDone ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {habit.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{habit.description}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-mono text-gray-600 bg-black/30 px-2 py-1 rounded">
                        {habit.time}
                      </span>
                      {habit.videoId && (
                        <button 
                            onClick={(e) => openVideo(e, habit.videoId, habit.title)}
                            className="p-2 bg-neon-cyan/10 text-neon-cyan rounded-lg hover:bg-neon-cyan hover:text-black transition-colors"
                            title="Watch Guide"
                        >
                            <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTracker;

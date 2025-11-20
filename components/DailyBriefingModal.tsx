
import React, { useState } from 'react';
import { Target, List, CheckCircle2, Loader2, Cpu, Lock } from 'lucide-react';
import { generateDailyPlan } from '../services/geminiService';
import { getUserProfile } from '../services/integrationService';

interface DailyBriefingModalProps {
  isOpen: boolean;
  onComplete: (plan: { mit: string; top3: string[] }) => void;
}

const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ isOpen, onComplete }) => {
  const [mit, setMit] = useState('');
  const [goals, setGoals] = useState(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGoalChange = (index: number, val: string) => {
    const newGoals = [...goals];
    newGoals[index] = val;
    setGoals(newGoals);
  };

  const handleAutoGenerate = async () => {
      setIsGenerating(true);
      const profile = getUserProfile();
      const plan = await generateDailyPlan(profile);
      
      setMit(plan.mit);
      setGoals(plan.top3);
      setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (mit && goals.every(g => g.trim() !== '')) {
      onComplete({ mit, top3: goals });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="bg-[#050507] border border-neon-cyan/30 w-full max-w-2xl rounded-3xl p-8 shadow-[0_0_100px_rgba(0,243,255,0.15)] relative overflow-hidden">
        
        {/* Security Lock Overlay Visuals */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-cyan animate-pulse" />
        <div className="absolute top-4 right-4 flex items-center gap-2 text-red-500 text-xs font-mono uppercase tracking-widest">
             <Lock className="w-3 h-3" /> System Locked
        </div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="bg-neon-cyan/10 p-4 rounded-2xl border border-neon-cyan/20 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                        <Target className="w-10 h-10 text-neon-cyan" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-mono font-bold text-white tracking-tighter">MORNING BRIEFING</h2>
                        <p className="text-gray-400 text-sm font-sans">Initialize daily protocol to unlock system.</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleAutoGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-neon-purple/10 hover:border-neon-purple/50 text-white hover:text-neon-purple transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50 group"
                >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                    {isGenerating ? 'Analyzing Profile...' : 'AI Auto-Plan'}
                </button>
            </div>

            <div className="space-y-8">
                <div className="space-y-3 group">
                    <label className="text-sm font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4" /> 1. Prime Objective (MIT)
                    </label>
                    <div className="relative">
                        <input 
                            autoFocus
                            type="text"
                            value={mit}
                            onChange={(e) => setMit(e.target.value)}
                            placeholder="One major task that moves the needle..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-5 text-xl text-white placeholder-gray-600 focus:border-neon-cyan focus:bg-neon-cyan/5 focus:ring-0 outline-none transition-all font-medium"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <List className="w-4 h-4" /> 2. Support Objectives
                    </label>
                    <div className="grid gap-3">
                        {goals.map((g, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <span className="text-xs font-mono text-gray-600 group-focus-within:text-white transition-colors">0{i + 1}</span>
                                <input 
                                    type="text"
                                    value={g}
                                    onChange={(e) => handleGoalChange(i, e.target.value)}
                                    placeholder={`Secondary Goal ${i + 1}`}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-700 focus:border-white/30 focus:bg-white/5 outline-none text-base transition-all"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!mit || goals.some(g => !g.trim())}
                    className="w-full py-5 bg-gradient-to-r from-white to-gray-200 text-black rounded-xl font-bold text-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all disabled:opacity-30 disabled:shadow-none mt-6 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                >
                    <CheckCircle2 className="w-6 h-6" />
                    INITIATE PROTOCOL
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBriefingModal;

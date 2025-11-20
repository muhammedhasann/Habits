
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Moon, CheckCircle, BrainCircuit, ArrowRight, Target, Sparkles, BarChart3, Lightbulb, Flag } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { generatePeriodicReview } from '../services/geminiService';
import { getUserProfile } from '../services/integrationService';
import ReactMarkdown from 'react-markdown';

type Period = 'weekly' | 'monthly' | 'quarterly';

interface ReviewData {
    wins: string[];
    lessons: string;
    nextGoals: string[];
}

const ReviewModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Period>('weekly');
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Mock Sleep Matrix Data (Sleep vs Focus)
  const [sleepMatrixData, setSleepMatrixData] = useState<{x: number, y: number, z: number}[]>([]);

  // Data State
  const [data, setData] = useState<Record<Period, ReviewData>>({
      weekly: { wins: ['', '', ''], lessons: '', nextGoals: ['', '', ''] },
      monthly: { wins: ['', '', ''], lessons: '', nextGoals: ['', '', ''] },
      quarterly: { wins: ['', '', ''], lessons: '', nextGoals: ['', '', ''] },
  });

  useEffect(() => {
    // Simulate gathering last 7 days data for Sleep Matrix
    const mockData = [];
    for(let i=0; i<7; i++) {
        mockData.push({
            x: Number((Math.random() * (9 - 5) + 5).toFixed(1)), // Sleep hours (5-9)
            y: Math.floor(Math.random() * (100 - 40) + 40), // Focus Score
            z: 1 // bubble size
        });
    }
    setSleepMatrixData(mockData);
  }, [activeTab]); // Refresh if real data existed per period

  const handleUpdate = (field: keyof ReviewData, value: any) => {
      setData(prev => ({
          ...prev,
          [activeTab]: {
              ...prev[activeTab],
              [field]: value
          }
      }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const profile = getUserProfile();
    const matrixSimple = sleepMatrixData.map(d => ({ sleep: d.x, focus: d.y }));
    const currentData = data[activeTab];
    
    const result = await generatePeriodicReview(
        activeTab,
        profile, 
        matrixSimple, 
        currentData.wins.filter(w => w), 
        currentData.lessons,
        currentData.nextGoals.filter(g => g)
    );
    
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  // Visual themes based on period
  const getTheme = () => {
      switch(activeTab) {
          case 'weekly': return { accent: 'text-neon-cyan', border: 'border-neon-cyan', bg: 'bg-neon-cyan/10', shadow: 'shadow-[0_0_20px_rgba(0,243,255,0.2)]', gradient: 'from-gray-900 to-black' };
          case 'monthly': return { accent: 'text-neon-purple', border: 'border-neon-purple', bg: 'bg-neon-purple/10', shadow: 'shadow-[0_0_20px_rgba(188,19,254,0.2)]', gradient: 'from-gray-900 to-[#0f0518]' };
          case 'quarterly': return { accent: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.2)]', gradient: 'from-gray-900 to-[#1a1600]' };
      }
  };
  const theme = getTheme();

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-4">
            <div>
                <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">
                    Protocol Review <span className={`text-sm uppercase ml-2 px-2 py-1 rounded border ${theme.border} ${theme.accent} bg-black`}>{activeTab}</span>
                </h2>
                <p className="text-gray-400">Analyze performance. Calibrate next cycle.</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
                {(['weekly', 'monthly', 'quarterly'] as Period[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                            activeTab === tab 
                            ? `${theme.bg} ${theme.accent} border border-white/5 shadow-lg` 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Data & Input */}
            <div className="space-y-8">
                
                {/* Section 1: Sleep Matrix */}
                <div className="bg-glass-bg border border-glass-border p-6 rounded-3xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Moon className={`w-5 h-5 ${theme.accent}`} /> Sleep vs Focus Matrix
                        </h3>
                        <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Recent Data</div>
                    </div>
                    
                    <div className="h-64 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="x" name="Sleep" unit="h" stroke="#666" tick={{fontSize: 12}}>
                                    <Label value="Sleep Duration (hrs)" offset={-5} position="insideBottom" fill="#666" fontSize={10} />
                                </XAxis>
                                <YAxis type="number" dataKey="y" name="Focus" unit="" stroke="#666" tick={{fontSize: 12}}>
                                    <Label value="Focus Score" angle={-90} position="insideLeft" fill="#666" fontSize={10} />
                                </YAxis>
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3' }} 
                                    contentStyle={{backgroundColor: '#050507', border: '1px solid #333', borderRadius: '8px'}} 
                                />
                                <Scatter name="Performance" data={sleepMatrixData} fill={activeTab === 'weekly' ? '#00f3ff' : activeTab === 'monthly' ? '#bc13fe' : '#facc15'} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section 2: Reflection */}
                <div className="bg-[#050507] border border-white/10 p-8 rounded-3xl shadow-2xl relative">
                    {/* Ambient Glow */}
                    <div className={`absolute -top-10 -left-10 w-40 h-40 ${theme.bg} blur-[80px] rounded-full opacity-20`} />

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                        <Lightbulb className={`w-6 h-6 ${theme.accent}`} /> Reflection Protocol
                    </h3>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wider flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> {activeTab} Wins
                            </label>
                            <div className="space-y-3">
                                {data[activeTab].wins.map((w, i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <span className="text-xs text-gray-600 font-mono">0{i+1}</span>
                                        <input 
                                            value={w}
                                            onChange={(e) => {
                                                const newWins = [...data[activeTab].wins];
                                                newWins[i] = e.target.value;
                                                handleUpdate('wins', newWins);
                                            }}
                                            placeholder={`Major ${activeTab} accomplishment...`}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500/50 outline-none text-sm transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wider flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-500" /> Lessons Learned
                            </label>
                            <textarea 
                                value={data[activeTab].lessons}
                                onChange={(e) => handleUpdate('lessons', e.target.value)}
                                placeholder="What friction did you encounter? How can it be removed?"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 outline-none text-sm min-h-[100px] resize-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Planning & AI */}
            <div className="space-y-6">
                 {/* Goal Setting Card */}
                 <div className={`bg-gradient-to-b ${theme.gradient} border border-white/10 p-8 rounded-3xl relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Target className={`w-48 h-48 ${theme.accent}`} />
                    </div>
                    
                    <h4 className={`text-lg font-bold ${theme.accent} uppercase mb-6 flex items-center gap-2 relative z-10`}>
                        <Flag className="w-5 h-5" /> {activeTab} Objectives
                    </h4>
                    
                    <div className="space-y-4 relative z-10">
                        {data[activeTab].nextGoals.map((g, i) => (
                            <div key={i} className="group">
                                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block ml-1 group-focus-within:text-white transition-colors">Target {i+1}</label>
                                <input 
                                    value={g}
                                    onChange={(e) => {
                                        const ng = [...data[activeTab].nextGoals];
                                        ng[i] = e.target.value;
                                        handleUpdate('nextGoals', ng);
                                    }}
                                    placeholder={`Goal for next ${activeTab}`}
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-current outline-none text-sm font-medium transition-all ${theme.accent.replace('text-', 'focus:border-')}`}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || data[activeTab].wins.every(w => !w)}
                        className={`mt-8 w-full py-5 bg-white hover:bg-gray-200 text-black font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-3 relative z-10 ${theme.shadow} disabled:opacity-50 disabled:shadow-none`}
                    >
                        {isAnalyzing ? <BrainCircuit className="w-6 h-6 animate-pulse" /> : <Sparkles className="w-6 h-6" />}
                        {isAnalyzing ? 'Processing Neural Data...' : 'Generate Strategic Debrief'}
                    </button>
                 </div>

                 {/* AI Analysis Output */}
                 {analysis && (
                    <div className="bg-glass-bg border border-glass-border rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 shadow-2xl relative overflow-hidden">
                        <div className={`absolute inset-0 ${theme.bg} opacity-20 pointer-events-none`} />
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 relative z-10">
                            <div className={`p-2 rounded-lg ${theme.bg}`}>
                                <BrainCircuit className={`w-5 h-5 ${theme.accent}`} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Neural Coach Assessment</h4>
                                <p className="text-[10px] text-gray-500">Generated via Gemini 3 Pro</p>
                            </div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-gray-300 relative z-10">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default ReviewModule;

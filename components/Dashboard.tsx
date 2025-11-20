
import React, { useMemo, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { DAILY_PROTOCOL } from '../constants';
import { Activity, Zap, Brain, Smile, Trophy, Shield, Star, TrendingUp, LockOpen } from 'lucide-react';
import { getGamificationState } from '../services/integrationService';
import { GamificationState, Badge } from '../types';
import { BADGES } from '../constants';

const Dashboard: React.FC = () => {
  const [gamification, setGamification] = useState<GamificationState>({ xp: 0, level: 1, streak: 0, badges: [], unlockedItems: [] });
  const [readinessHistory, setReadinessHistory] = useState<any[]>([]);
  
  useEffect(() => {
      setGamification(getGamificationState());
      
      // Mock 7-day readiness trend (simulated from BioSync)
      const rh = [];
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      for(let i=0; i<7; i++) {
          rh.push({ 
              day: days[i], 
              score: Math.floor(Math.random() * (95 - 60) + 60) 
          });
      }
      setReadinessHistory(rh);
  }, []);

  const data = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Mock data for demo purposes if local storage is empty
      const focusBase = 60 + Math.random() * 30;
      const energyBase = 50 + Math.random() * 40;
      
      result.push({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        focus: focusBase,
        energy: energyBase,
        mood: 60 + Math.random() * 20
      });
    }
    return result;
  }, []);

  const radarData = [
    { subject: 'Focus', A: 80, fullMark: 100 },
    { subject: 'Energy', A: 65, fullMark: 100 },
    { subject: 'Mood', A: 75, fullMark: 100 },
    { subject: 'Habits', A: 90, fullMark: 100 },
    { subject: 'Sleep', A: 85, fullMark: 100 },
    { subject: 'Grit', A: 70, fullMark: 100 },
  ];

  const earnedBadges = BADGES.filter(b => gamification.badges.includes(b.id));

  return (
    <div className="space-y-8 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">Neural Metrics</h2>
            <p className="text-gray-400">Quantify your existence. Optimize performance.</p>
        </div>
        
        {/* XP / Level Widget */}
        <div className="bg-glass-bg border border-glass-border rounded-2xl p-4 flex items-center gap-4 min-w-[280px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                    {gamification.level}
                </div>
            </div>
            <div className="flex-1 relative z-10">
                <div className="flex justify-between text-xs mb-1 font-bold tracking-wider">
                    <span className="text-gray-400">NEURO LEVEL</span>
                    <span className="text-neon-cyan">{gamification.xp} XP</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-cyan shadow-[0_0_10px_#00f3ff]" style={{ width: `${(gamification.xp % 500) / 5}%` }} />
                </div>
            </div>
        </div>
      </div>

      {/* Top Row: Metrics + Trends */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* Stat Cards */}
         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-glass-bg border border-glass-border p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-20 h-20 text-neon-cyan" /></div>
                <p className="text-xs text-gray-500 font-mono uppercase mb-1">Current Streak</p>
                <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-bold text-white">{gamification.streak}</div>
                    <span className="text-sm text-neon-cyan font-medium">Days</span>
                </div>
            </div>
            <div className="bg-glass-bg border border-glass-border p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Brain className="w-20 h-20 text-purple-500" /></div>
                <p className="text-xs text-gray-500 font-mono uppercase mb-1">Avg Focus</p>
                <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-bold text-white">78</div>
                    <span className="text-sm text-gray-400 font-medium">/100</span>
                </div>
            </div>
            <div className="bg-glass-bg border border-glass-border p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Smile className="w-20 h-20 text-pink-500" /></div>
                <p className="text-xs text-gray-500 font-mono uppercase mb-1">Mood Index</p>
                <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-bold text-white">82</div>
                    <span className="text-sm text-gray-400 font-medium">%</span>
                </div>
            </div>
         </div>
         
         {/* Readiness Trend Widget */}
         <div className="bg-gradient-to-b from-gray-900 to-black border border-neon-cyan/20 p-5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(0,243,255,0.05)]">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-xs text-neon-cyan uppercase font-bold tracking-wider block">Bio-Readiness</span>
                    <span className="text-[10px] text-gray-500">Last 7 Days</span>
                </div>
                <div className="bg-neon-cyan/10 p-1.5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-neon-cyan" />
                </div>
            </div>
            <div className="flex-1 min-h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readinessHistory}>
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#00f3ff" 
                            strokeWidth={3} 
                            dot={{ fill: '#000', stroke: '#00f3ff', strokeWidth: 2, r: 3 }} 
                            activeDot={{ r: 6, fill: '#fff' }} 
                        />
                        <XAxis dataKey="day" tick={{fill: '#666', fontSize: 10}} axisLine={false} tickLine={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Charts Grid - UNLOCKED FOR ALL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Area Chart */}
          <div className="bg-glass-bg border border-glass-border p-6 rounded-2xl h-96 relative">
             <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] text-neon-cyan bg-neon-cyan/5 px-2 py-1 rounded border border-neon-cyan/10">
                <LockOpen className="w-3 h-3" /> Analytics Unlocked
             </div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-cyan" /> 30-Day Performance
            </h3>
            <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#050507', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="focus" stackId="1" stroke="#bc13fe" fill="url(#colorFocus)" />
                <Area type="monotone" dataKey="energy" stackId="2" stroke="#00f3ff" fill="url(#colorEnergy)" />
            </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-glass-bg border border-glass-border p-6 rounded-2xl h-96 relative flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-white mb-2 self-start w-full flex items-center gap-2">
                <Shield className="w-4 h-4 text-neon-purple" /> Bio-Psycho Balance
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                    name="Current State"
                    dataKey="A"
                    stroke="#bc13fe"
                    strokeWidth={2}
                    fill="#bc13fe"
                    fillOpacity={0.3}
                />
                <Tooltip contentStyle={{ backgroundColor: '#050507', borderColor: '#333' }} itemStyle={{ color: '#bc13fe' }} />
                </RadarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Badges Gallery */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
        </h3>
        <div className="flex flex-wrap gap-4">
            {earnedBadges.length > 0 ? earnedBadges.map(badge => (
                <div key={badge.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-yellow-500/50 transition-colors">
                    <div className="text-3xl bg-black/40 p-2 rounded-full">{badge.icon}</div>
                    <div>
                        <div className="text-sm font-bold text-white">{badge.name}</div>
                        <div className="text-xs text-gray-500">{badge.description}</div>
                    </div>
                </div>
            )) : (
                <div className="w-full p-6 border border-dashed border-gray-800 rounded-2xl text-center text-gray-500">
                    Start your journey to earn badges.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

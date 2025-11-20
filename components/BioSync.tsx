
import React, { useState, useEffect } from 'react';
import { Activity, Heart, Moon, Footprints, RefreshCw, BrainCircuit, Watch, Smartphone } from 'lucide-react';
import { syncHealthData, getUserProfile } from '../services/integrationService';
import { analyzeBioData } from '../services/geminiService';
import { HealthMetrics, UserProfile } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BioSync: React.FC = () => {
    const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<{score: number, advice: string, workout: string} | null>(null);
    const [profile, setProfile] = useState<UserProfile>(getUserProfile());

    const handleSync = async () => {
        setLoading(true);
        const data = await syncHealthData();
        setMetrics(data);
        setLoading(false);
        
        // Auto analyze after sync
        setAnalyzing(true);
        const result = await analyzeBioData(data, profile);
        setAnalysis(result);
        setAnalyzing(false);
    };

    useEffect(() => {
        const stored = localStorage.getItem('neuroflow-health-metrics');
        if (stored) {
            setMetrics(JSON.parse(stored));
        }
    }, []);

    // Mock graph data based on current metrics
    const hrvData = metrics ? [
        { time: '00:00', val: metrics.hrv - 10 },
        { time: '04:00', val: metrics.hrv + 5 },
        { time: '06:00', val: metrics.hrv + 15 },
        { time: '08:00', val: metrics.hrv },
        { time: '12:00', val: metrics.hrv - 5 },
    ] : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">Bio-Sync Core</h2>
                    <p className="text-gray-400">Integrate wearable telemetry. Optimize biology.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSync}
                        disabled={loading}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 flex items-center gap-2 transition-all"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Watch className="w-4 h-4" />}
                        Sync Wearables
                    </button>
                </div>
            </div>

            {/* Integration Status */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Google Fit Connected
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Oura Ring Active
                </div>
            </div>

            {metrics ? (
                <>
                    {/* AI Analysis Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-neon-cyan/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BrainCircuit className="w-32 h-32 text-neon-cyan" />
                        </div>
                        
                        {analyzing ? (
                            <div className="flex items-center gap-3 text-neon-cyan animate-pulse">
                                <BrainCircuit className="w-6 h-6" />
                                <span className="font-mono">Analyzing biological telemetry...</span>
                            </div>
                        ) : analysis ? (
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-neon-cyan font-bold uppercase tracking-widest mb-2">Readiness Score</p>
                                    <div className="text-6xl font-mono font-bold text-white">
                                        {analysis.score}
                                    </div>
                                    <div className="h-2 w-full bg-gray-800 rounded-full mt-4 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${analysis.score > 80 ? 'bg-green-500' : analysis.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                            style={{ width: `${analysis.score}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 flex flex-col justify-center space-y-4">
                                    <div>
                                        <h4 className="text-white font-bold mb-1">Coach's Insight</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">"{analysis.advice}"</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 inline-block">
                                        <span className="text-xs text-gray-500 uppercase">Recommended Training</span>
                                        <p className="text-neon-cyan font-bold">{analysis.workout}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Metric Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-glass-bg border border-glass-border p-5 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                <span className="text-xs text-gray-500">HRV (ms)</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{metrics.hrv}</div>
                            <div className="text-xs text-gray-400 mt-1">RHR: {metrics.restingHeartRate} bpm</div>
                        </div>
                        <div className="bg-glass-bg border border-glass-border p-5 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <Moon className="w-5 h-5 text-purple-500" />
                                <span className="text-xs text-gray-500">Sleep</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{metrics.sleepHours}h</div>
                            <div className="text-xs text-gray-400 mt-1">Score: {metrics.sleepScore}</div>
                        </div>
                        <div className="bg-glass-bg border border-glass-border p-5 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <Footprints className="w-5 h-5 text-orange-500" />
                                <span className="text-xs text-gray-500">Activity</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{metrics.steps}</div>
                            <div className="text-xs text-gray-400 mt-1">Steps today</div>
                        </div>
                        <div className="bg-glass-bg border border-glass-border p-5 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                <span className="text-xs text-gray-500">Load</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{metrics.activityScore}</div>
                            <div className="text-xs text-gray-400 mt-1">Daily Strain</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-glass-bg border border-glass-border p-6 rounded-2xl h-64">
                        <h3 className="text-sm font-bold text-white mb-4">Heart Rate Variability (24h)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hrvData}>
                                <defs>
                                    <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#050507', borderColor: 'rgba(255,255,255,0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="val" stroke="#ef4444" fillOpacity={1} fill="url(#colorHrv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
                    <Activity className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl text-white font-bold mb-2">No Biometrics Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Connect your peripherals to enable the Gemini Coach. We currently support Google Fit, Oura, and Whoop via simulated integration.
                    </p>
                    <button 
                        onClick={handleSync}
                        disabled={loading}
                        className="px-6 py-3 bg-neon-cyan text-black font-bold rounded-full hover:bg-cyan-300 transition-colors"
                    >
                        Initialize Connection
                    </button>
                </div>
            )}
        </div>
    );
};

export default BioSync;

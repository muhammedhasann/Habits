
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Save, Sparkles, PlayCircle, Smile, Frown, Meh, Zap, Brain, Calendar, Tag, Bot, Activity } from 'lucide-react';
import { analyzeJournalEntry, transcribeAudio, generateSpeech, decodeAudioData } from '../services/geminiService';
import { getUserData, saveUserData } from '../services/integrationService';
import { DailyStats } from '../types';

const MOODS = [
    { label: 'Focus', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
    { label: 'Flow', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    { label: 'Happy', icon: Smile, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    { label: 'Neutral', icon: Meh, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
    { label: 'Stressed', icon: Frown, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
];

const SmartJournal: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedLog = getUserData<any>(`log-${today}`);
    if (savedLog) {
        if (savedLog.journalEntry) setEntry(savedLog.journalEntry);
        if (savedLog.stats) setStats(savedLog.stats);
        if (savedLog.stats?.selectedMood) setSelectedMood(savedLog.stats.selectedMood);
    }

    const hist = [];
    for(let i=0; i<30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const item = getUserData<any>(`log-${dateStr}`);
        if (item) {
            if (item.journalEntry || item.stats) {
                hist.push({ date: dateStr, ...item });
            }
        }
    }
    setHistory(hist);
  }, [today, stats]);

  const handleMicClick = async () => {
    if (isRecording) return;
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
           const base64 = (reader.result as string).split(',')[1];
           setIsAnalyzing(true);
           const text = await transcribeAudio(base64, 'audio/webm');
           setEntry(prev => prev + (prev ? ' ' : '') + text);
           setIsAnalyzing(false);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setTimeout(() => {
          mediaRecorder.stop();
          setIsRecording(false);
      }, 10000); 
    } catch (err) {
      console.error("Mic error", err);
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
      if (!entry) return;
      setIsAnalyzing(true);
      const result = await analyzeJournalEntry(entry);
      
      if (selectedMood) result.selectedMood = selectedMood;

      setStats(result);
      
      const currentLog = getUserData<any>(`log-${today}`) || { date: today, completedHabitIds: [] };
      currentLog.journalEntry = entry;
      currentLog.stats = result;
      saveUserData(`log-${today}`, currentLog);
      
      setIsAnalyzing(false);
  };

  const readAdvice = async () => {
      if (!stats?.aiAdvice) return;
      const audio = await generateSpeech(stats.aiAdvice);
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const buffer = await decodeAudioData(audio, audioCtxRef.current);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">Neural Journal</h2>
                <p className="text-gray-400">Log your day. AI Analysis.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Input & Mood */}
            <div className="lg:col-span-2 space-y-6">
                {/* Mood Selector */}
                <div className="bg-glass-bg border border-glass-border rounded-3xl p-6">
                    <p className="text-xs text-gray-400 uppercase mb-4 font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Current State
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {MOODS.map((m) => (
                            <button
                                key={m.label}
                                onClick={() => setSelectedMood(m.label)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                                    selectedMood === m.label 
                                    ? `${m.bg} ${m.color} ${m.border} shadow-[0_0_15px_rgba(0,0,0,0.2)] scale-105` 
                                    : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                }`}
                            >
                                <m.icon className="w-5 h-5" />
                                <span className="text-sm font-bold">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Input */}
                <div className="bg-gradient-to-b from-gray-900 to-black border border-glass-border rounded-3xl p-1 shadow-2xl">
                    <div className="bg-[#050507] rounded-[22px] p-6 min-h-[300px] relative">
                        <textarea 
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="Write about your day..."
                            className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-700 resize-none font-sans text-lg leading-relaxed p-2 min-h-[250px]"
                        />
                        
                        <div className="absolute bottom-6 right-6 flex gap-3">
                            <button 
                                onClick={handleMicClick}
                                className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                                    isRecording 
                                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/40' 
                                    : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                                }`}
                                title="Record Audio"
                            >
                                <Mic className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !entry}
                                className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-neon-cyan transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                {isAnalyzing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isAnalyzing ? 'Thinking...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analysis Result */}
                {stats && (
                    <div className="bg-glass-bg border border-glass-border rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 space-y-6">
                            {/* Scores */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Focus', val: stats.focus, color: 'text-cyan-400' },
                                    { label: 'Energy', val: stats.energy, color: 'text-yellow-400' },
                                    { label: 'Mood', val: stats.mood, color: 'text-pink-400' }
                                ].map((s) => (
                                    <div key={s.label} className="text-center bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.val}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Tags */}
                            {stats.tags && stats.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {stats.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-400 border border-white/5">
                                            # {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Advice */}
                            <div className="bg-white/5 border-l-4 border-neon-purple p-5 rounded-r-2xl relative">
                                <div className="flex items-start gap-3">
                                    <div>
                                        <h4 className="text-xs text-neon-purple uppercase font-bold mb-2">Insight</h4>
                                        <p className="text-lg text-white font-light leading-relaxed">"{stats.aiAdvice}"</p>
                                    </div>
                                </div>
                                <button onClick={readAdvice} className="absolute top-4 right-4 text-neon-purple hover:text-white transition-colors bg-black/20 p-2 rounded-full">
                                    <PlayCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: History Sidebar */}
            <div className="bg-[#0a0a0c] border border-glass-border p-6 rounded-3xl lg:h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Past Logs
                </h3>
                <div className="space-y-3">
                    {history.map((item, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10 group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-neon-cyan font-mono bg-neon-cyan/10 px-2 py-0.5 rounded">{item.date}</span>
                                {item.stats?.selectedMood && (
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">{item.stats.selectedMood}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3 group-hover:text-gray-200 transition-colors font-light">
                                {item.journalEntry || "No text entry."}
                            </p>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="text-gray-600 text-sm text-center py-10">No logs yet.</div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SmartJournal;
